import {
  formatTutorSseEvent,
  parseTutorSseEvent,
} from "../TutorStream.contract.js";
import type { TutorStreamEvent } from "../TutorStream.contract.js";

class TutorStreamContractFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "TutorStreamContractFailure";
  }
}

function assert(
  condition: boolean,
  caseId: string,
  reason: string,
): asserts condition {
  if (!condition) {
    throw new TutorStreamContractFailure(caseId, reason);
  }
}

function testTokenEventRoundTrip(): void {
  const caseId = "tutor-stream-token-event-round-trip";

  const event: TutorStreamEvent = {
    event: "token",
    data: { token: "Hello world " },
  };

  const formatted = formatTutorSseEvent(event);
  assert(
    formatted.startsWith("event: token\ndata: {"),
    caseId,
    "invalid formatting",
  );

  const parsed = parseTutorSseEvent(formatted);
  assert(parsed !== null, caseId, "failed to parse formatted token event");
  assert(parsed.event === "token", caseId, "event name mismatch");
  assert(
    parsed.data.token === "Hello world ",
    caseId,
    "token content mismatch",
  );
}

function testAnsweredEventRoundTrip(): void {
  const caseId = "tutor-stream-answered-event-round-trip";

  const event: TutorStreamEvent = {
    event: "answered",
    data: {
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
            pageNumber: 2,
            slideNumber: null,
            boundingBox: null,
            textSpan: null,
            timeRange: null,
            label: "Page 2",
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
    },
  };

  const formatted = formatTutorSseEvent(event);
  const parsed = parseTutorSseEvent(formatted);

  assert(parsed !== null, caseId, "failed to parse answered event");
  assert(parsed.event === "answered", caseId, "event name mismatch");
  assert(
    parsed.data.answerText === "Mitosis has four phases.",
    caseId,
    "answerText mismatch",
  );
  assert(
    parsed.data.citations.length === 1,
    caseId,
    "citations length mismatch",
  );
}

function testInsufficientContextEventRoundTrip(): void {
  const caseId = "tutor-stream-insufficient-event-round-trip";

  const event: TutorStreamEvent = {
    event: "insufficient_context",
    data: {
      status: "insufficient_context",
      reason: "retrieval_insufficient",
      message: "No relevant notes in your scope.",
      retrieval: {
        reason: "no_scoped_context",
        availableChunkCount: 0,
        requiredChunkCount: 1,
      },
    },
  };

  const formatted = formatTutorSseEvent(event);
  const parsed = parseTutorSseEvent(formatted);

  assert(parsed !== null, caseId, "failed to parse insufficient_context event");
  assert(
    parsed.event === "insufficient_context",
    caseId,
    "event name mismatch",
  );
  assert(
    parsed.data.reason === "retrieval_insufficient",
    caseId,
    "reason mismatch",
  );
}

function testRefusedEventRoundTrip(): void {
  const caseId = "tutor-stream-refused-event-round-trip";

  const event: TutorStreamEvent = {
    event: "refused",
    data: {
      status: "refused",
      reason: "citation_validation_failed",
      message: "I could not produce a grounded answer with valid citations.",
    },
  };

  const formatted = formatTutorSseEvent(event);
  const parsed = parseTutorSseEvent(formatted);

  assert(parsed !== null, caseId, "failed to parse refused event");
  assert(parsed.event === "refused", caseId, "event name mismatch");
  assert(
    parsed.data.reason === "citation_validation_failed",
    caseId,
    "reason mismatch",
  );
}

function testErrorEventRoundTrip(): void {
  const caseId = "tutor-stream-error-event-round-trip";

  const event: TutorStreamEvent = {
    event: "error",
    data: {
      error: "tutor_api_unavailable",
      message: "Tutor service is temporarily unavailable.",
    },
  };

  const formatted = formatTutorSseEvent(event);
  const parsed = parseTutorSseEvent(formatted);

  assert(parsed !== null, caseId, "failed to parse error event");
  assert(parsed.event === "error", caseId, "event name mismatch");
  assert(
    parsed.data.error === "tutor_api_unavailable",
    caseId,
    "error code mismatch",
  );
}

function testDoneEventRoundTrip(): void {
  const caseId = "tutor-stream-done-event-round-trip";

  const event: TutorStreamEvent = {
    event: "done",
    data: {
      completedAt: "2026-08-26T00:00:01.000Z",
    },
  };

  const formatted = formatTutorSseEvent(event);
  const parsed = parseTutorSseEvent(formatted);

  assert(parsed !== null, caseId, "failed to parse done event");
  assert(parsed.event === "done", caseId, "event name mismatch");
  assert(
    parsed.data.completedAt === "2026-08-26T00:00:01.000Z",
    caseId,
    "completedAt mismatch",
  );
}

function testMalformedBlocks(): void {
  const caseId = "tutor-stream-malformed-blocks";

  assert(
    parseTutorSseEvent("") === null,
    caseId,
    "empty string must return null",
  );
  assert(
    parseTutorSseEvent("   ") === null,
    caseId,
    "whitespace string must return null",
  );
  assert(
    parseTutorSseEvent("data: not json") === null,
    caseId,
    "missing event name must return null",
  );
  assert(
    parseTutorSseEvent("event: token\ndata: not json") === null,
    caseId,
    "invalid json must return null",
  );
  assert(
    parseTutorSseEvent("event: unknown_event\ndata: {}") === null,
    caseId,
    "unknown event must return null",
  );
}

function main(): void {
  testTokenEventRoundTrip();
  testAnsweredEventRoundTrip();
  testInsufficientContextEventRoundTrip();
  testRefusedEventRoundTrip();
  testErrorEventRoundTrip();
  testDoneEventRoundTrip();
  testMalformedBlocks();
}

main();
