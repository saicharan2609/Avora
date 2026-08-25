import type {
  TutorAnswerCandidate,
  TutorAnswerInvocationPort,
  TutorAnswerStreamEvent,
} from "@avora/ai/gateway/invocation";
import {
  createTutorGateway,
} from "@avora/ai/gateway/tutor";
import type {
  TutorGatewayPort,
  TutorQuery,
} from "@avora/ai/gateway/tutor";

import type {
  CitationId,
  MessageId,
  ResourceId,
  StudentId,
} from "@avora/core/identity";
import type {
  DbRetrievalChunkId,
  DbRetrievalChunkingStrategyVersion,
  DbRetrievalExtractionDocumentId,
  DbRetrievalSanitisationStrategyVersion,
} from "@avora/db/repositories/chunks";

import type { IsoDateTimeString } from "@avora/core/time";
import { parseTutorSseEvent } from "@avora/core/contracts/tutor";
import type { TutorStreamEvent } from "@avora/core/contracts/tutor";

import { createTutorSseStream } from "../_shared/stream.js";

class BenchmarkFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "BenchmarkFailure";
  }
}

function assert(condition: boolean, caseId: string, reason: string): asserts condition {
  if (!condition) {
    throw new BenchmarkFailure(caseId, reason);
  }
}

const mockChunkId = "chunk-mock-0001" as DbRetrievalChunkId;
const mockResourceId = "resource-mock-0001" as ResourceId;
const mockExtractionDocId = "ext-doc-0001" as DbRetrievalExtractionDocumentId;


function createMockQuery(): TutorQuery {
  return {
    studentId: "student-mock-0001" as StudentId,
    conversationId: null,
    messageId: "message-mock-0001" as MessageId,
    question: "Explain the four phases of mitosis.",
    scope: {
      termId: "term-0001",
      subjectId: "subject-0001",
      structureUnitId: "structure-unit-0001",
      resourceId: mockResourceId,
    },
    depth: "standard",
    answerFormat: "explanation",
    language: "en",
    createdAt: "2026-08-26T00:00:00.000Z" as IsoDateTimeString,
  };
}

function createDelayedStreamingInvocationPort(


  tokens: readonly string[],
  candidate: TutorAnswerCandidate,
  delayMs = 15,
): TutorAnswerInvocationPort {
  return {
    invokeTutorAnswer: async () => ({ candidate }),
    streamTutorAnswer: async function* (): AsyncIterable<TutorAnswerStreamEvent> {
      for (const token of tokens) {
        if (delayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
        yield { type: "token", token };
      }
      yield { type: "completed", candidate };
    },
  };
}

async function testTtftPreCompletionDeliveryBenchmark(): Promise<void> {
  const caseId = "web-stream-ttft-pre-completion-benchmark";
  const query = createMockQuery();

  const candidate: TutorAnswerCandidate = {
    answerMessageId: "550e8400-e29b-41d4-a716-446655440000" as MessageId,
    answerText: "Prophase, metaphase, anaphase, telophase.",
    citations: [
      {
        citationId: "550e8400-e29b-41d4-a716-446655440001" as CitationId,
        chunkId: mockChunkId,
        resourceId: mockResourceId,
        locator: {
          kind: "document_page",
          pageNumber: 1,
          slideNumber: null,
          boundingBox: null,
          textSpan: null,
          timeRange: null,
          label: "Page 1",
        },
        quote: "Mitosis has four phases",
      },
    ],
    createdAt: "2026-08-26T00:00:00.000Z" as IsoDateTimeString,
  };

  const tokens = ["Prophase, ", "metaphase, ", "anaphase, ", "telophase."];
  const tutorAnswerInvocation = createDelayedStreamingInvocationPort(
    tokens,
    candidate,
    20,
  );

  const tutorGateway: TutorGatewayPort = createTutorGateway({
    retrievalSearch: {
      search: async () => ({
        input: {
          studentId: query.studentId,
          query: query.question,
          scope: query.scope,
          limits: { maxChunks: 4 },
          insufficiency: { minChunkCount: 1 },
        },
        results: [
          {
            rank: 1,
            chunk: {
              chunkId: mockChunkId,
              studentId: query.studentId,
              resourceId: mockResourceId,
              extractionDocumentId: mockExtractionDocId,
              sourceBlockIds: [],
              scope: {
                termId: query.scope.termId,
                subjectId: query.scope.subjectId,
                structureUnitId: query.scope.structureUnitId,
                resourceId: mockResourceId,
              },
              contentKind: "paragraph",

              text: "Mitosis has four phases: prophase, metaphase, anaphase, and telophase.",
              tokenEstimate: 16,
              sanitisation: {
                status: "sanitised",
                strategyVersion:
                  "sanitiser.v1" as DbRetrievalSanitisationStrategyVersion,
                warnings: [],
              },
              locator: {
                kind: "document_page",
                pageNumber: 1,
                slideNumber: null,
                boundingBox: null,
                textSpan: null,
                timeRange: null,
                label: "Page 1",
              },
              sourceContentHash: "hash-001",
              chunkingStrategyVersion:
                "chunker.v1" as DbRetrievalChunkingStrategyVersion,
              status: "ready",

              sortOrder: 0,
              createdAt: query.createdAt,
              updatedAt: query.createdAt,
            },
          },
        ],

        sufficiency: {
          insufficient: false,
          studentId: query.studentId,
          query: query.question,
          scope: query.scope,
          availableChunkCount: 1,
        },
      }),
    },
    tutorAnswerInvocation,
    defaults: {
      maxChunks: 4,
      minChunkCount: 1,
      qualityTier: "standard",
    },
  });

  const stream = createTutorSseStream({ tutorGateway, tutorQuery: query });
  const reader = stream.getReader();
  const decoder = new TextDecoder();

  const streamStartTime = Date.now();
  let firstTokenDeliveryTime = 0;
  let completionDeliveryTime = 0;
  const events: TutorStreamEvent[] = [];

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";

    for (const block of blocks) {
      const event = parseTutorSseEvent(block);
      if (event !== null) {
        events.push(event);
        if (event.event === "token" && firstTokenDeliveryTime === 0) {
          firstTokenDeliveryTime = Date.now();
        } else if (event.event === "answered") {
          completionDeliveryTime = Date.now();
        }
      }
    }
  }

  const ttftMs = firstTokenDeliveryTime - streamStartTime;
  const totalMs = completionDeliveryTime - streamStartTime;

  assert(firstTokenDeliveryTime > 0, caseId, "no first token was delivered");
  assert(completionDeliveryTime > 0, caseId, "no completed answered event was delivered");
  assert(
    firstTokenDeliveryTime < completionDeliveryTime,
    caseId,
    `TTFT (${ttftMs} duration) must be strictly faster than total completion (${totalMs} duration)`,
  );
  assert(
    ttftMs < 1500,
    caseId,
    `TTFT (${ttftMs} duration) must satisfy the sub-1500 milliseconds latency budget`,
  );



  const tokenEvents = events.filter((e) => e.event === "token");
  assert(tokenEvents.length === tokens.length, caseId, "expected 4 progressive token events");

  const answeredEvents = events.filter((e) => e.event === "answered");
  assert(answeredEvents.length === 1, caseId, "expected exactly one final answered event");
}

async function main(): Promise<void> {
  await testTtftPreCompletionDeliveryBenchmark();
}

await main();
