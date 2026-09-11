import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";

import {
  startClaimLoop,
  toClaimLoopEntries,
  type ClaimLoopController,
} from "./runtime/claim-loop.js";
import {
  createWorkerRuntime,
  readWorkerRuntimeEnvironment,
} from "./runtime/createWorkerRuntime.js";
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

// The claim loop is started after the health server so a worker-runtime
// construction failure (e.g. a missing required environment variable) never
// prevents the health endpoint itself from coming up — the health endpoint
// has no dependency on worker orchestration, unchanged from before this
// group. `claimLoopController` is read lazily by the shutdown hook below so
// shutdown behaves correctly whether or not orchestration ever started.
let claimLoopController: ClaimLoopController | undefined;

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
  stopWorkerOrchestration: async () => {
    if (claimLoopController !== undefined) {
      await claimLoopController.stop();
    }
  },
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

try {
  const workerRuntime = createWorkerRuntime(readWorkerRuntimeEnvironment());

  claimLoopController = startClaimLoop(toClaimLoopEntries(workerRuntime));

  console.log("Avora worker orchestration started");
} catch (error) {
  // Startup/lifecycle logging exception (apps/worker/README.md's
  // Pre-Stage-12 readiness exception; packages/config/eslint/base.js scopes
  // no-console off for exactly this file). A construction failure here is a
  // configuration problem (e.g. a missing required worker-tier environment
  // variable) — the process stays alive answering /healthz, matching this
  // process's behaviour before worker orchestration existed, rather than
  // crashing the container outright.
  console.error(
    "Avora worker orchestration failed to start; continuing with health endpoint only.",
    error,
  );
}