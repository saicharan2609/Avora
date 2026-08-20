import {
  askTutorRequestBodySchema,
  askTutorResponseBodySchema,
} from "@avora/core/contracts/tutor";
import type {
  AskTutorParsedRequestBody,
  AskTutorRequestBody,
  AskTutorResponseBody,
} from "@avora/core/contracts/tutor";
import type {
  ConversationId,
  MessageId,
  ResourceId,
  StudentId,
} from "@avora/core/identity";
import type {
  IsoDateTimeString,
} from "@avora/core/time";
import type {
  DbRetrievalChunkRecord,
} from "@avora/db/repositories/chunks";
import {
  createTutorGateway,
} from "@avora/ai";
import type {
  TutorAnswerCandidate,
  TutorAnswerInvocationPort,
  TutorGatewayResponse,
  TutorQuery,
} from "@avora/ai";
import type {
  RetrievalSearchPort,
  ScopedSearchResult,
} from "@avora/retrieval";

type TutorRetrievalSearchInput =
  Parameters<RetrievalSearchPort["search"]>[0];

export type TutorGroundingE2eCaseResult = Readonly<{
  caseId: string;
  passed: true;
}>;

export async function runTutorGroundingE2eHarness(): Promise<
  readonly TutorGroundingE2eCaseResult[]
> {
  const results = [
    await runGroundedAnswerCase(),
    await runInsufficientContextCase(),
    await runUnresolvedCitationCase(),
    await runMissingCitationCase(),
    await runMalformedRequestCase(),
  ];

  if (results.length === 0) {
    throw new TutorGroundingE2eFailure(
      "tutor-grounding",
      "harness has no cases and must fail closed",
    );
  }

  return results;
}

class TutorGroundingE2eFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "TutorGroundingE2eFailure";
  }
}

async function runGroundedAnswerCase(): Promise<TutorGroundingE2eCaseResult> {
  const caseId = "tutor-grounding-e2e-grounded-answer";

  const authenticatedStudentId = ids.studentA;
  const parsedBody = parseTutorRequest(caseId, createValidAskTutorRequest());

  let observedSearchInput: TutorRetrievalSearchInput | undefined;

  const gateway = createTutorGateway({
    retrievalSearch: {
      search: async (input) => {
        observedSearchInput = input;
        return createSufficientScopedSearchResult(input);
      },
    },
    tutorAnswerInvocation: createTutorAnswerInvocation(
      createValidTutorAnswerCandidate(),
    ),
    defaults: {
      maxChunks: 4,
      minChunkCount: 1,
      qualityTier: "standard",
    },
  });

  const response = await gateway.answerTutorQuery(
    mapAskTutorRequestToTutorQuery({
      body: parsedBody,
      studentId: authenticatedStudentId,
      createdAt: constants.now,
    }),
  );

  const responseBody = serializeTutorGatewayResponse(response);
  const parsedResponse = askTutorResponseBodySchema.parse(responseBody);

  const searchInput = requireObservedSearchInput({
    caseId,
    input: observedSearchInput,
  });

  assert(
    searchInput.studentId === authenticatedStudentId,
    caseId,
    "retrieval search did not use authenticated student id",
  );

  assert(
    searchInput.scope.resourceId === ids.resource,
    caseId,
    "retrieval search did not preserve requested resource scope",
  );

  assert(
    parsedResponse.status === "answered",
    caseId,
    "expected answered response",
  );

  assert(
    parsedResponse.citations.length === 1,
    caseId,
    "answered response must include one citation",
  );

  assert(
    parsedResponse.context.allowedChunkIds.includes(
      parsedResponse.citations[0]!.chunkId,
    ),
    caseId,
    "citation chunk id must resolve to allowed chunk ids",
  );

  assert(
    parsedResponse.context.evidence[0]?.sourceBlockIds[0] === ids.sourceBlock,
    caseId,
    "source block id was not preserved through API response",
  );

  assert(
    parsedResponse.citations[0]!.locator.pageNumber === 2,
    caseId,
    "citation locator page number was not preserved",
  );

  return {
    caseId,
    passed: true,
  };
}

async function runInsufficientContextCase(): Promise<TutorGroundingE2eCaseResult> {
  const caseId = "tutor-grounding-e2e-insufficient-context";

  let invocationCalled = false;

  const gateway = createTutorGateway({
    retrievalSearch: {
      search: async (input) => createInsufficientScopedSearchResult(input),
    },
    tutorAnswerInvocation: {
      invokeTutorAnswer: async () => {
        invocationCalled = true;
        return {
          candidate: createValidTutorAnswerCandidate(),
        };
      },
    },
    defaults: {
      maxChunks: 4,
      minChunkCount: 1,
      qualityTier: "standard",
    },
  });

  const response = await gateway.answerTutorQuery(
    createTutorQueryFromValidRequest(ids.studentA),
  );

  const parsedResponse = askTutorResponseBodySchema.parse(
    serializeTutorGatewayResponse(response),
  );

  assert(
    !invocationCalled,
    caseId,
    "provider invocation was called despite insufficient retrieval context",
  );

  assert(
    parsedResponse.status === "insufficient_context",
    caseId,
    "expected insufficient_context response",
  );

  return {
    caseId,
    passed: true,
  };
}

async function runUnresolvedCitationCase(): Promise<TutorGroundingE2eCaseResult> {
  const caseId = "tutor-grounding-e2e-unresolved-citation";

  const gateway = createTutorGateway({
    retrievalSearch: {
      search: async (input) => createSufficientScopedSearchResult(input),
    },
    tutorAnswerInvocation: createTutorAnswerInvocation({
      ...createValidTutorAnswerCandidate(),
      citations: [
        {
          ...createValidCitation(),
          chunkId: ids.unknownChunk,
        },
      ],
    }),
    defaults: {
      maxChunks: 4,
      minChunkCount: 1,
      qualityTier: "standard",
    },
  });

  const response = await gateway.answerTutorQuery(
    createTutorQueryFromValidRequest(ids.studentA),
  );

  const parsedResponse = askTutorResponseBodySchema.parse(
    serializeTutorGatewayResponse(response),
  );

  assert(
    parsedResponse.status === "refused",
    caseId,
    "unresolved citation must be refused, not returned as answered",
  );

  assert(
    parsedResponse.reason === "citation_validation_failed",
    caseId,
    "unresolved citation must use citation_validation_failed refusal reason",
  );

  return {
    caseId,
    passed: true,
  };
}

async function runMissingCitationCase(): Promise<TutorGroundingE2eCaseResult> {
  const caseId = "tutor-grounding-e2e-missing-citation";

  const gateway = createTutorGateway({
    retrievalSearch: {
      search: async (input) => createSufficientScopedSearchResult(input),
    },
    tutorAnswerInvocation: createTutorAnswerInvocation({
      ...createValidTutorAnswerCandidate(),
      citations: [],
    }),
    defaults: {
      maxChunks: 4,
      minChunkCount: 1,
      qualityTier: "standard",
    },
  });

  const response = await gateway.answerTutorQuery(
    createTutorQueryFromValidRequest(ids.studentA),
  );

  const parsedResponse = askTutorResponseBodySchema.parse(
    serializeTutorGatewayResponse(response),
  );

  assert(
    parsedResponse.status === "refused",
    caseId,
    "answer without citations must be refused",
  );

  return {
    caseId,
    passed: true,
  };
}

async function runMalformedRequestCase(): Promise<TutorGroundingE2eCaseResult> {
  const caseId = "tutor-grounding-e2e-malformed-request";

  const emptyQuestion = askTutorRequestBodySchema.safeParse({
    ...createValidAskTutorRequest(),
    question: "   ",
  });

  assert(
    !emptyQuestion.success,
    caseId,
    "empty tutor question must fail request validation",
  );

  const clientSuppliedStudent = askTutorRequestBodySchema.safeParse({
    ...createValidAskTutorRequest(),
    studentId: ids.studentB,
  });

  assert(
    !clientSuppliedStudent.success,
    caseId,
    "request body must reject client-supplied studentId",
  );

  return {
    caseId,
    passed: true,
  };
}

function requireObservedSearchInput(input: Readonly<{
  caseId: string;
  input: TutorRetrievalSearchInput | undefined;
}>): TutorRetrievalSearchInput {
  const observedInput = input.input;

  if (observedInput === undefined) {
    throw new TutorGroundingE2eFailure(
      input.caseId,
      "retrieval search was not called",
    );
  }

  return observedInput;
}

function parseTutorRequest(
  caseId: string,
  request: AskTutorRequestBody,
): AskTutorParsedRequestBody {
  const parsed = askTutorRequestBodySchema.safeParse(request);

  if (!parsed.success) {
    throw new TutorGroundingE2eFailure(
      caseId,
      `valid request fixture failed schema validation: ${parsed.error.message}`,
    );
  }

  return parsed.data;
}

function createTutorQueryFromValidRequest(studentId: StudentId): TutorQuery {
  return mapAskTutorRequestToTutorQuery({
    body: parseTutorRequest(
      "tutor-grounding-e2e-query-fixture",
      createValidAskTutorRequest(),
    ),
    studentId,
    createdAt: constants.now,
  });
}

function mapAskTutorRequestToTutorQuery(input: Readonly<{
  body: AskTutorParsedRequestBody;
  studentId: StudentId;
  createdAt: IsoDateTimeString;
}>): TutorQuery {
  return {
    studentId: input.studentId,
    conversationId:
      input.body.conversationId === null
        ? null
        : input.body.conversationId as ConversationId,
    messageId: input.body.messageId as MessageId,
    question: input.body.question,
    scope: {
      termId: input.body.scope.termId,
      subjectId: input.body.scope.subjectId,
      structureUnitId: input.body.scope.structureUnitId,
      resourceId:
        input.body.scope.resourceId === null
          ? null
          : input.body.scope.resourceId as ResourceId,
    },
    depth: input.body.depth,
    answerFormat: input.body.answerFormat,
    language: input.body.language,
    createdAt: input.createdAt,
  };
}

function serializeTutorGatewayResponse(
  response: TutorGatewayResponse,
): AskTutorResponseBody {
  if (response.status === "answered") {
    return {
      status: "answered",
      answerMessageId: response.answerMessageId,
      answerText: response.answerText,
      citations: response.citations.map((citation) => ({
        citationId: citation.citationId,
        chunkId: citation.chunkId,
        resourceId: citation.resourceId,
        locator: citation.locator,
        quote: citation.quote,
      })),
      context: {
        version: response.context.version,
        allowedChunkIds: response.context.allowedChunkIds,
        evidence: response.context.evidence.map((chunk) => ({
          chunkId: chunk.chunkId,
          resourceId: chunk.resourceId,
          extractionDocumentId: chunk.extractionDocumentId,
          sourceBlockIds: chunk.sourceBlockIds,
          locator: chunk.locator,
          contentKind: chunk.contentKind,
          text: chunk.text,
          sortOrder: chunk.sortOrder,
        })),
      },
      createdAt: response.createdAt,
    };
  }

  if (response.status === "insufficient_context") {
    return {
      status: "insufficient_context",
      reason: response.reason,
      message: response.message,
      retrieval:
        response.retrieval === null
          ? null
          : {
              reason: response.retrieval.reason,
              availableChunkCount: response.retrieval.availableChunkCount,
              requiredChunkCount: response.retrieval.requiredChunkCount,
            },
    };
  }

  return {
    status: "refused",
    reason: response.reason,
    message: response.message,
  };
}

function createTutorAnswerInvocation(
  candidate: TutorAnswerCandidate,
): TutorAnswerInvocationPort {
  return {
    invokeTutorAnswer: async (input) => {
      assert(
        input.context.allowedChunkIds.length > 0,
        "tutor-grounding-e2e-provider",
        "provider seam received empty grounded context",
      );

      return {
        candidate,
      };
    },
  };
}

function createSufficientScopedSearchResult(
  input: TutorRetrievalSearchInput,
): ScopedSearchResult {
  return {
    input,
    results: [
      {
        rank: 1,
        chunk: createSyntheticChunkRecord(input.studentId),
      },
    ],
    sufficiency: {
      insufficient: false,
      studentId: input.studentId,
      query: input.query,
      scope: input.scope,
      availableChunkCount: 1,
    },
  };
}

function createInsufficientScopedSearchResult(
  input: TutorRetrievalSearchInput,
): ScopedSearchResult {
  return {
    input,
    results: [],
    sufficiency: {
      insufficient: true,
      reason: "no_scoped_context",
      studentId: input.studentId,
      query: input.query,
      scope: input.scope,
      availableChunkCount: 0,
      requiredChunkCount: input.insufficiency.minChunkCount,
    },
  };
}

function createSyntheticChunkRecord(studentId: StudentId): DbRetrievalChunkRecord {
  return {
    chunkId: ids.chunk,
    studentId,
    resourceId: ids.resource,
    extractionDocumentId: ids.extractionDocument,
    sourceBlockIds: [
      ids.sourceBlock,
    ],
    scope: {
      termId: ids.term,
      subjectId: ids.subject,
      structureUnitId: ids.structureUnit,
      resourceId: ids.resource,
    },
    contentKind: "paragraph",
    text: constants.evidenceText,
    tokenEstimate: 16,
    sanitisation: {
      status: "sanitised",
      strategyVersion:
        "sanitiser.v1" as DbRetrievalChunkRecord["sanitisation"]["strategyVersion"],
      warnings: [],
    },
    locator: constants.locator,
    sourceContentHash:
      "sha256:tutorgroundinge2e000000000000000000000000000000000000000000000001",
    chunkingStrategyVersion:
      "chunker.v1" as DbRetrievalChunkRecord["chunkingStrategyVersion"],
    status: "ready",
    sortOrder: 0,
    createdAt: constants.now,
    updatedAt: constants.now,
  };
}

function createValidTutorAnswerCandidate(): TutorAnswerCandidate {
  return {
    answerMessageId: ids.answerMessage,
    answerText: constants.answerText,
    citations: [
      createValidCitation(),
    ],
    createdAt: constants.now,
  };
}

function createValidCitation(): TutorAnswerCandidate["citations"][number] {
  return {
    citationId: ids.citation,
    chunkId: ids.chunk,
    resourceId: ids.resource,
    locator: constants.locator,
    quote: constants.quote,
  };
}

function createValidAskTutorRequest(): AskTutorRequestBody {
  return {
    conversationId: null,
    messageId: ids.message,
    question: constants.question,
    scope: {
      termId: ids.term,
      subjectId: ids.subject,
      structureUnitId: ids.structureUnit,
      resourceId: ids.resource,
    },
    depth: "standard",
    answerFormat: "explanation",
    language: "en",
  };
}

function assert(
  condition: boolean,
  caseId: string,
  reason: string,
): asserts condition {
  if (!condition) {
    throw new TutorGroundingE2eFailure(caseId, reason);
  }
}

const ids = {
  studentA: "00000000-0000-4000-8000-000000021001" as StudentId,
  studentB: "00000000-0000-4000-8000-000000021002" as StudentId,
  term: "00000000-0000-4000-8000-000000021101",
  subject: "00000000-0000-4000-8000-000000021102",
  structureUnit: "00000000-0000-4000-8000-000000021103",
  resource: "00000000-0000-4000-8000-000000021201" as ResourceId,
  extractionDocument:
    "00000000-0000-4000-8000-000000021301" as DbRetrievalChunkRecord["extractionDocumentId"],
  sourceBlock:
    "00000000-0000-4000-8000-000000021401" as DbRetrievalChunkRecord["sourceBlockIds"][number],
  chunk: "00000000-0000-4000-8000-000000021501" as DbRetrievalChunkRecord["chunkId"],
  unknownChunk:
    "00000000-0000-4000-8000-000000021599" as DbRetrievalChunkRecord["chunkId"],
  citation:
    "00000000-0000-4000-8000-000000021601" as TutorAnswerCandidate["citations"][number]["citationId"],
  message: "00000000-0000-4000-8000-000000021701",
  answerMessage:
    "00000000-0000-4000-8000-000000021702" as TutorAnswerCandidate["answerMessageId"],
} as const;

const constants = {
  now: "2026-08-20T15:30:00.000Z" as IsoDateTimeString,
  question:
    "What does the tutor grounding e2e note say about graph representation?",
  evidenceText:
    "A graph is represented synthetically as vertices and edges for tutor grounding validation.",
  answerText:
    "The supplied note says a graph is represented synthetically as vertices and edges for tutor grounding validation.",
  quote:
    "A graph is represented synthetically as vertices and edges",
  locator: {
    kind: "document_page",
    pageNumber: 2,
    slideNumber: null,
    boundingBox: {
      x: 0.1,
      y: 0.2,
      width: 0.8,
      height: 0.15,
      unit: "ratio",
    },
    textSpan: {
      startOffset: 0,
      endOffset: 86,
    },
    timeRange: null,
    label: "Synthetic tutor grounding page 2",
  } satisfies DbRetrievalChunkRecord["locator"],
} as const;