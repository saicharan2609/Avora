import type {
  TutorApiAnsweredResponseBody,
  TutorApiInsufficientContextResponseBody,
  TutorApiRefusedResponseBody,
} from "@avora/core/contracts/tutor";
import { formatTutorSseEvent } from "@avora/core/contracts/tutor";

import { consumeTutorReadableStream } from "../TutorStreamConsumer.contract.js";
import type { TutorStreamClientState } from "../TutorStreamConsumer.contract.js";

class TutorStreamConsumerTestFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "TutorStreamConsumerTestFailure";
  }
}

function assert(
  condition: boolean,
  caseId: string,
  reason: string,
): asserts condition {
  if (!condition) {
    throw new TutorStreamConsumerTestFailure(caseId, reason);
  }
}

function createSseStreamFromStrings(
  chunks: readonly string[],
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

async function testIncrementalTokenStreaming(): Promise<void> {
  const caseId = "tutor-stream-consumer-incremental-tokens";

  const answeredPayload: TutorApiAnsweredResponseBody = {
    status: "answered",
    answerMessageId: "550e8400-e29b-41d4-a716-446655440000",
    answerText: "Mitosis has four phases.",
    citations: [
      {
        citationId: "550e8400-e29b-41d4-a716-446655440001",
        chunkId: "550e8400-e29b-41d4-a716-446655440002",
        resourceId: "550e8400-e29b-41d4-a716-446655440003",
        locator: {
          kind: "document_page",
          pageNumber: 1,
          slideNumber: null,
          boundingBox: null,
          textSpan: null,
          timeRange: null,
          label: "Page 1",
        },
        quote: "Mitosis has four phases.",
      },
    ],
    context: {
      version: "grounded-context-envelope.v1",
      allowedChunkIds: ["550e8400-e29b-41d4-a716-446655440002"],
      evidence: [],
    },
    createdAt: "2026-08-26T00:00:00.000Z",
  };

  const sseData = [
    formatTutorSseEvent({ event: "token", data: { token: "Mitosis " } }),
    formatTutorSseEvent({ event: "token", data: { token: "has " } }),
    formatTutorSseEvent({ event: "token", data: { token: "four " } }),
    formatTutorSseEvent({ event: "token", data: { token: "phases." } }),
    formatTutorSseEvent({ event: "answered", data: answeredPayload }),
    formatTutorSseEvent({
      event: "done",
      data: { completedAt: "2026-08-26T00:00:01.000Z" },
    }),
  ];

  const receivedTokens: string[] = [];
  const stateHistory: TutorStreamClientState[] = [];

  const stream = createSseStreamFromStrings(sseData);
  const finalState = await consumeTutorReadableStream(stream, {
    onToken: (token) => {
      receivedTokens.push(token);
    },
    onStateChange: (state) => {
      stateHistory.push(state);
    },
  });

  assert(
    receivedTokens.join("") === "Mitosis has four phases.",
    caseId,
    "token accumulation mismatch",
  );
  assert(
    finalState.status === "completed",
    caseId,
    "expected completed status",
  );
  assert(
    finalState.status === "completed" &&
      finalState.answer.citations.length === 1,
    caseId,
    "citations not attached on completion",
  );
  assert(
    finalState.status === "completed" &&
      finalState.accumulatedText === "Mitosis has four phases.",
    caseId,
    "final text mismatch",
  );
}

async function testInsufficiencyEvent(): Promise<void> {
  const caseId = "tutor-stream-consumer-insufficiency";

  const insufficiencyPayload: TutorApiInsufficientContextResponseBody = {
    status: "insufficient_context",
    reason: "retrieval_insufficient",
    message: "No notes found on this topic in your materials.",
    retrieval: {
      reason: "no_scoped_context",
      availableChunkCount: 0,
      requiredChunkCount: 1,
    },
  };

  const sseData = [
    formatTutorSseEvent({
      event: "insufficient_context",
      data: insufficiencyPayload,
    }),
    formatTutorSseEvent({
      event: "done",
      data: { completedAt: "2026-08-26T00:00:01.000Z" },
    }),
  ];

  const stream = createSseStreamFromStrings(sseData);
  const finalState = await consumeTutorReadableStream(stream);

  assert(
    finalState.status === "insufficient_context",
    caseId,
    "expected insufficient_context status",
  );
  assert(
    finalState.status === "insufficient_context" &&
      finalState.response.reason === "retrieval_insufficient",
    caseId,
    "reason mismatch",
  );
}

async function testRefusalEvent(): Promise<void> {
  const caseId = "tutor-stream-consumer-refusal";

  const refusalPayload: TutorApiRefusedResponseBody = {
    status: "refused",
    reason: "citation_validation_failed",
    message:
      "I could not produce a grounded answer with valid citations from your materials.",
  };

  const sseData = [
    formatTutorSseEvent({ event: "refused", data: refusalPayload }),
    formatTutorSseEvent({
      event: "done",
      data: { completedAt: "2026-08-26T00:00:01.000Z" },
    }),
  ];

  const stream = createSseStreamFromStrings(sseData);
  const finalState = await consumeTutorReadableStream(stream);

  assert(finalState.status === "refused", caseId, "expected refused status");
  assert(
    finalState.status === "refused" &&
      finalState.response.reason === "citation_validation_failed",
    caseId,
    "refusal reason mismatch",
  );
}

async function testErrorEvent(): Promise<void> {
  const caseId = "tutor-stream-consumer-error-event";

  const sseData = [
    formatTutorSseEvent({
      event: "error",
      data: {
        error: "tutor_api_unavailable",
        message: "Tutor API is currently unavailable.",
      },
    }),
  ];

  const stream = createSseStreamFromStrings(sseData);
  const finalState = await consumeTutorReadableStream(stream);

  assert(finalState.status === "error", caseId, "expected error status");
}

async function testAbortSignalCancellation(): Promise<void> {
  const caseId = "tutor-stream-consumer-abort-signal";

  const controller = new AbortController();
  controller.abort();

  const stream = createSseStreamFromStrings([
    formatTutorSseEvent({ event: "token", data: { token: "Hello" } }),
  ]);

  const finalState = await consumeTutorReadableStream(stream, {
    signal: controller.signal,
  });

  assert(
    finalState.status === "error",
    caseId,
    "expected error status upon abort",
  );
}

async function testTtftConsumerTimingBenchmark(): Promise<void> {
  const caseId = "tutor-stream-consumer-ttft-timing-benchmark";

  const answeredPayload: TutorApiAnsweredResponseBody = {
    status: "answered",
    answerMessageId: "550e8400-e29b-41d4-a716-446655440000",
    answerText: "Chunk 1 Chunk 2",
    citations: [],
    context: {
      version: "grounded-context-envelope.v1",
      allowedChunkIds: [],
      evidence: [],
    },
    createdAt: "2026-08-26T00:00:00.000Z",
  };

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // Chunk 1 after delay
      await new Promise((r) => setTimeout(r, 10));
      controller.enqueue(
        encoder.encode(
          formatTutorSseEvent({ event: "token", data: { token: "Chunk 1 " } }),
        ),
      );

      // Chunk 2 after second delay
      await new Promise((r) => setTimeout(r, 20));
      controller.enqueue(
        encoder.encode(
          formatTutorSseEvent({ event: "token", data: { token: "Chunk 2" } }),
        ),
      );

      // Final answered after third delay
      await new Promise((r) => setTimeout(r, 10));
      controller.enqueue(
        encoder.encode(
          formatTutorSseEvent({ event: "answered", data: answeredPayload }),
        ),
      );
      controller.enqueue(
        encoder.encode(
          formatTutorSseEvent({
            event: "done",
            data: { completedAt: "2026-08-26T00:00:01.000Z" },
          }),
        ),
      );
      controller.close();
    },
  });

  const startTime = Date.now();
  let firstTokenDeliveryTime = 0;
  let completionTime = 0;

  const finalState = await consumeTutorReadableStream(stream, {
    onToken: () => {
      if (firstTokenDeliveryTime === 0) {
        firstTokenDeliveryTime = Date.now();
      }
    },
    onStateChange: (state) => {
      if (state.status === "completed") {
        completionTime = Date.now();
      }
    },
  });

  assert(finalState.status === "completed", caseId, "expected completed state");
  assert(firstTokenDeliveryTime > 0, caseId, "no first token recorded");
  assert(completionTime > 0, caseId, "no completion time recorded");
  assert(
    firstTokenDeliveryTime < completionTime,
    caseId,
    `first token (${firstTokenDeliveryTime - startTime} duration) must arrive before completion (${completionTime - startTime} duration)`,
  );

}

async function main(): Promise<void> {
  await testIncrementalTokenStreaming();
  await testInsufficiencyEvent();
  await testRefusalEvent();
  await testErrorEvent();
  await testAbortSignalCancellation();
  await testTtftConsumerTimingBenchmark();
}

await main();
