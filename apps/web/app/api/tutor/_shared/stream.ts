import type { TutorGatewayPort, TutorQuery } from "@avora/ai/gateway/tutor";
import { formatTutorSseEvent } from "@avora/core/contracts/tutor";
import type { TutorStreamEvent } from "@avora/core/contracts/tutor";

import { mapTutorApiError } from "./errors";
import { serializeTutorGatewayResponse } from "./mapper";

export function createTutorSseStream(params: {
  tutorGateway: TutorGatewayPort;
  tutorQuery: TutorQuery;
}): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const stream = params.tutorGateway.streamTutorQuery(params.tutorQuery);

        for await (const event of stream) {
          if (event.type === "token") {
            const tokenEvent: TutorStreamEvent = {
              event: "token",
              data: { token: event.token },
            };
            controller.enqueue(encoder.encode(formatTutorSseEvent(tokenEvent)));
          } else if (event.type === "final") {
            const serialized = serializeTutorGatewayResponse(event.response);

            if (serialized.status === "answered") {
              const answeredEvent: TutorStreamEvent = {
                event: "answered",
                data: serialized,
              };
              controller.enqueue(
                encoder.encode(formatTutorSseEvent(answeredEvent)),
              );
            } else if (serialized.status === "insufficient_context") {
              const insufficientEvent: TutorStreamEvent = {
                event: "insufficient_context",
                data: serialized,
              };
              controller.enqueue(
                encoder.encode(formatTutorSseEvent(insufficientEvent)),
              );
            } else {
              const refusedEvent: TutorStreamEvent = {
                event: "refused",
                data: serialized,
              };
              controller.enqueue(
                encoder.encode(formatTutorSseEvent(refusedEvent)),
              );
            }
          }
        }

        const doneEvent: TutorStreamEvent = {
          event: "done",
          data: { completedAt: new Date().toISOString() },
        };
        controller.enqueue(encoder.encode(formatTutorSseEvent(doneEvent)));
        controller.close();
      } catch (error) {
        const apiError = mapTutorApiError(error);
        const errorEvent: TutorStreamEvent = {
          event: "error",
          data: {
            error: apiError.code,
            message: apiError.message,
          },
        };
        controller.enqueue(encoder.encode(formatTutorSseEvent(errorEvent)));
        controller.close();
      }
    },
  });
}

export function createTutorSseResponse(
  stream: ReadableStream<Uint8Array>,
): Response {
  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
