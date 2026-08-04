import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";

import { createShutdownController } from "./runtime/shutdown.js";

const healthPort = 3000;

function writeHealthResponse(response: ServerResponse): void {
  response.writeHead(200, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });

  response.end(JSON.stringify({ status: "ok" }));
}

function writeNotFoundResponse(response: ServerResponse): void {
  response.writeHead(404, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });

  response.end(JSON.stringify({ error: "not_found" }));
}

function writeMethodNotAllowedResponse(response: ServerResponse): void {
  response.writeHead(405, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    allow: "GET",
  });

  response.end(JSON.stringify({ error: "method_not_allowed" }));
}

function handleHealthRequest(request: IncomingMessage, response: ServerResponse): void {
  if (request.url !== "/healthz") {
    writeNotFoundResponse(response);
    return;
  }

  if (request.method !== "GET") {
    writeMethodNotAllowedResponse(response);
    return;
  }

  writeHealthResponse(response);
}

const healthServer = createServer(handleHealthRequest);

const shutdown = createShutdownController({
  closeHealthServer: () =>
    new Promise<void>((resolve, reject) => {
      healthServer.close((error) => {
        if (error !== undefined) {
          reject(error);
          return;
        }

        resolve();
      });
    }),
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

healthServer.listen(healthPort, "0.0.0.0", () => {
  console.log(`Avora worker health endpoint listening on ${healthPort}`);
});