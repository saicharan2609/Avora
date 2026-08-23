import type {
  MessageId,
  ResourceId,
  StudentId,
} from "@avora/core/identity";
import type {
  IsoDateTimeString,
} from "@avora/core/time";
import type {
  DbRetrievalChunkContentKind,
  DbRetrievalChunkId,
  DbRetrievalChunkLocator,
  DbRetrievalChunkRecord,
  DbRetrievalChunkSanitisationStatus,
  DbRetrievalChunkStatus,
  DbRetrievalChunkingStrategyVersion,
  DbRetrievalExtractionDocumentId,
  DbRetrievalSanitisationStrategyVersion,
} from "@avora/db/repositories/chunks";
import {
  createTutorGateway,
  groundedContextEnvelopeVersion,
} from "../../../gateway/tutor/index.js";
import type {
  GroundedContextEnvelope,
  TutorQuery,
} from "../../../gateway/tutor/index.js";
import type {
  TutorAnswerInvocationInput,
} from "../../../gateway/invocation/index.js";
import {
  resolveTutorAnswerRoutingConfig,
} from "../../../gateway/routing/TutorAnswerRoutingPolicy.js";
import type {
  AiProviderInvocationGateState,
  TutorAnswerTaskBudgets,
} from "../../../gateway/budget-gate/index.js";

import {
  createGeminiTutorAnswerAdapter,
} from "../GeminiTutorAnswerAdapter.js";
import type {
  GeminiTutorAnswerClient,
  GeminiTutorAnswerGenerateContentInput,
} from "../GeminiTutorAnswerClient.js";

type CreateTutorGatewayInput = Parameters<typeof createTutorGateway>[0];
type RetrievalSearchPort = CreateTutorGatewayInput["retrievalSearch"];
type ScopedSearchResult = Awaited<ReturnType<RetrievalSearchPort["search"]>>;

class GeminiTutorAnswerAdapterContractFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "GeminiTutorAnswerAdapterContractFailure";
  }
}

function assert(
  condition: boolean,
  caseId: string,
  reason: string,
): asserts condition {
  if (!condition) {
    throw new GeminiTutorAnswerAdapterContractFailure(caseId, reason);
  }
}

const knownChunkId = "chunk-known-0001" as DbRetrievalChunkId;
const unknownChunkId = "chunk-unknown-0002" as DbRetrievalChunkId;
const knownResourceId = "resource-0001" as ResourceId;
const knownLocator: DbRetrievalChunkLocator = {
  kind: "document_page",
  pageNumber: 3,
  slideNumber: null,
  boundingBox: null,
  textSpan: null,
  timeRange: null,
  label: "Contract test page 3",
};

const authorizedInvocationGateState: AiProviderInvocationGateState = "enabled";

const authorizedTaskBudgets: TutorAnswerTaskBudgets = {
  standard: { maxOutputTokens: 4096 },
  high: { maxOutputTokens: 8192 },
};

function createNeverCalledClient(caseId: string): GeminiTutorAnswerClient {
  return createFakeClient(async () => {
    throw new GeminiTutorAnswerAdapterContractFailure(
      caseId,
      "provider client must not be called when authorization fails closed",
    );
  });
}

function createFakeQuery(): TutorQuery {
  return {
    studentId: "student-0001" as StudentId,
    conversationId: null,
    messageId: "message-0001" as MessageId,
    question: "What does the supplied note say about mitosis?",
    scope: {
      termId: "term-0001",
      subjectId: "subject-0001",
      structureUnitId: "structure-unit-0001",
      resourceId: knownResourceId,
    },
    depth: "standard",
    answerFormat: "explanation",
    language: "en",
    createdAt: "2026-08-14T03:30:00.000Z" as IsoDateTimeString,
  };
}

function createFakeEnvelope(): GroundedContextEnvelope {
  return {
    version: groundedContextEnvelopeVersion,
    query: createFakeQuery(),
    evidence: [
      {
        chunkId: knownChunkId,
        resourceId: knownResourceId,
        extractionDocumentId: "extraction-doc-0001" as DbRetrievalExtractionDocumentId,
        sourceBlockIds: [],
        locator: knownLocator,
        contentKind: "paragraph" as DbRetrievalChunkContentKind,
        text: "Mitosis proceeds through prophase, metaphase, anaphase, and telophase.",
        sortOrder: 0,
      },
    ],
    allowedChunkIds: [knownChunkId],
  };
}

function createFakeClient(
  respond: (
    input: GeminiTutorAnswerGenerateContentInput,
  ) => ReturnType<GeminiTutorAnswerClient["generateContent"]>,
): GeminiTutorAnswerClient {
  return {
    generateContent: respond,
  };
}

function createFullChunkRecord(): DbRetrievalChunkRecord {
  return {
    chunkId: knownChunkId,
    studentId: "student-0001" as StudentId,
    resourceId: knownResourceId,
    extractionDocumentId: "extraction-doc-0001" as DbRetrievalExtractionDocumentId,
    sourceBlockIds: [],
    scope: {
      termId: "term-0001",
      subjectId: "subject-0001",
      structureUnitId: "structure-unit-0001",
      resourceId: knownResourceId,
    },
    contentKind: "paragraph" as DbRetrievalChunkContentKind,
    text: "Mitosis proceeds through prophase, metaphase, anaphase, and telophase.",
    tokenEstimate: 16,
    sanitisation: {
      status: "sanitised" as DbRetrievalChunkSanitisationStatus,
      strategyVersion: "sanitiser.v1" as DbRetrievalSanitisationStrategyVersion,
      warnings: [],
    },
    locator: knownLocator,
    sourceContentHash:
      "sha256:phase-e-gateway-refusal-contract-test-0000000000000000000000000001",
    chunkingStrategyVersion: "chunker.v1" as DbRetrievalChunkingStrategyVersion,
    status: "ready" as DbRetrievalChunkStatus,
    sortOrder: 0,
    createdAt: "2026-08-14T03:30:00.000Z" as IsoDateTimeString,
    updatedAt: "2026-08-14T03:30:00.000Z" as IsoDateTimeString,
  };
}

function createSufficientScopedSearchResult(): ScopedSearchResult {
  const query = createFakeQuery();

  return {
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
        chunk: createFullChunkRecord(),
      },
    ],
    sufficiency: {
      insufficient: false,
      studentId: query.studentId,
      query: query.question,
      scope: query.scope,
      availableChunkCount: 1,
    },
  };
}

function createGatewayWithClient(
  respond: (
    input: GeminiTutorAnswerGenerateContentInput,
  ) => ReturnType<GeminiTutorAnswerClient["generateContent"]>,
) {
  return createTutorGateway({
    retrievalSearch: {
      search: async () => createSufficientScopedSearchResult(),
    },
    tutorAnswerInvocation: createGeminiTutorAnswerAdapter({
      client: createFakeClient(respond),
      invocationGateState: authorizedInvocationGateState,
      taskBudgets: authorizedTaskBudgets,
    }),
    defaults: {
      maxChunks: 4,
      minChunkCount: 1,
      qualityTier: "standard",
    },
  });
}

function createInvocationInput(
  overrides: Partial<TutorAnswerInvocationInput> = {},
): TutorAnswerInvocationInput {
  return {
    task: "tutor.answer",
    qualityTier: "standard",
    query: createFakeQuery(),
    context: createFakeEnvelope(),
    ...overrides,
  };
}

async function runResolvesCitationFromTrustedEnvelopeCase(): Promise<void> {
  const caseId = "gemini-tutor-answer-adapter-resolves-citation-from-trusted-envelope";

  const adapter = createGeminiTutorAnswerAdapter({
    client: createFakeClient(async () => ({
      text: JSON.stringify({
        answerText: "Mitosis proceeds through prophase, metaphase, anaphase, and telophase.",
        citations: [
          {
            chunkId: knownChunkId,
            quote: "Mitosis proceeds through prophase, metaphase, anaphase, and telophase.",
          },
        ],
      }),
    })),
    invocationGateState: authorizedInvocationGateState,
    taskBudgets: authorizedTaskBudgets,
  });

  const result = await adapter.invokeTutorAnswer(createInvocationInput());

  assert(
    result.candidate.citations.length === 1,
    caseId,
    "expected exactly one resolved citation",
  );
  assert(
    result.candidate.citations[0]?.resourceId === knownResourceId,
    caseId,
    "resolved citation resourceId did not come from the trusted envelope",
  );
  assert(
    result.candidate.citations[0]?.locator.label === knownLocator.label,
    caseId,
    "resolved citation locator did not come from the trusted envelope",
  );
  assert(
    typeof result.candidate.citations[0]?.citationId === "string" &&
      result.candidate.citations[0].citationId.length > 0,
    caseId,
    "resolved citation did not receive a generated citationId",
  );
}

async function runSelectsRoutingConfigByQualityTierCase(): Promise<void> {
  const caseId = "gemini-tutor-answer-adapter-selects-routing-config-by-quality-tier";

  const observedRequests: GeminiTutorAnswerGenerateContentInput[] = [];

  const adapter = createGeminiTutorAnswerAdapter({
    client: createFakeClient(async (requestInput) => {
      observedRequests.push(requestInput);

      return {
        text: JSON.stringify({
          answerText: "Answer.",
          citations: [{ chunkId: knownChunkId, quote: "Mitosis proceeds" }],
        }),
      };
    }),
    invocationGateState: authorizedInvocationGateState,
    taskBudgets: authorizedTaskBudgets,
  });

  await adapter.invokeTutorAnswer(createInvocationInput({ qualityTier: "standard" }));
  await adapter.invokeTutorAnswer(createInvocationInput({ qualityTier: "high" }));

  assert(observedRequests.length === 2, caseId, "expected two provider calls");
  assert(
    observedRequests[0]?.model === "gemini-3.6-flash" &&
      observedRequests[0]?.maxOutputTokens === 4096,
    caseId,
    "standard quality tier did not route to the approved standard model configuration",
  );
  assert(
    observedRequests[1]?.model === "gemini-3.1-pro-preview" &&
      observedRequests[1]?.maxOutputTokens === 8192,
    caseId,
    "high quality tier did not route to the approved high model configuration",
  );
  assert(
    observedRequests.every((request) => request.responseMimeType === "application/json"),
    caseId,
    "provider requests did not request JSON output",
  );
}

async function runNeverSendsResourceIdOrLocatorToProviderCase(): Promise<void> {
  const caseId = "gemini-tutor-answer-adapter-never-sends-resource-id-or-locator";

  let capturedUserContentText: string | undefined;

  const adapter = createGeminiTutorAnswerAdapter({
    client: createFakeClient(async (requestInput) => {
      capturedUserContentText = requestInput.userContentText;

      return {
        text: JSON.stringify({
          answerText: "Answer.",
          citations: [{ chunkId: knownChunkId, quote: "Mitosis proceeds" }],
        }),
      };
    }),
    invocationGateState: authorizedInvocationGateState,
    taskBudgets: authorizedTaskBudgets,
  });

  await adapter.invokeTutorAnswer(createInvocationInput());

  assert(capturedUserContentText !== undefined, caseId, "provider was never called");

  const dataPayload = JSON.parse(capturedUserContentText as string) as Readonly<{
    evidence: readonly Record<string, unknown>[];
  }>;

  assert(
    dataPayload.evidence.length === 1,
    caseId,
    "sealed evidence did not contain the expected single chunk",
  );
  assert(
    Object.keys(dataPayload.evidence[0] ?? {}).sort().join(",") === "chunkId,text",
    caseId,
    "sealed evidence item exposed fields beyond chunkId and text to the provider",
  );
}

async function runRejectsMalformedJsonResponseCase(): Promise<void> {
  const caseId = "gemini-tutor-answer-adapter-rejects-malformed-json-response";

  const adapter = createGeminiTutorAnswerAdapter({
    client: createFakeClient(async () => ({
      text: "not valid json",
    })),
    invocationGateState: authorizedInvocationGateState,
    taskBudgets: authorizedTaskBudgets,
  });

  await assertRejects(
    () => adapter.invokeTutorAnswer(createInvocationInput()),
    caseId,
    "adapter did not reject a non-JSON provider response",
  );
}

async function runRejectsOutputContractViolationCase(): Promise<void> {
  const caseId = "gemini-tutor-answer-adapter-rejects-output-contract-violation";

  const adapter = createGeminiTutorAnswerAdapter({
    client: createFakeClient(async () => ({
      text: JSON.stringify({ answerText: 123, citations: "not-an-array" }),
    })),
    invocationGateState: authorizedInvocationGateState,
    taskBudgets: authorizedTaskBudgets,
  });

  await assertRejects(
    () => adapter.invokeTutorAnswer(createInvocationInput()),
    caseId,
    "adapter did not reject a provider response violating the output contract",
  );
}

async function runRejectsUnresolvableCitationCase(): Promise<void> {
  const caseId = "gemini-tutor-answer-adapter-rejects-unresolvable-citation";

  const adapter = createGeminiTutorAnswerAdapter({
    client: createFakeClient(async () => ({
      text: JSON.stringify({
        answerText: "Answer.",
        citations: [{ chunkId: unknownChunkId, quote: "not in evidence" }],
      }),
    })),
    invocationGateState: authorizedInvocationGateState,
    taskBudgets: authorizedTaskBudgets,
  });

  await assertRejects(
    () => adapter.invokeTutorAnswer(createInvocationInput()),
    caseId,
    "adapter did not reject a citation referencing a chunkId outside the grounded context envelope",
  );
}

async function runRejectsEmptyResponseCase(): Promise<void> {
  const caseId = "gemini-tutor-answer-adapter-rejects-empty-response";

  const adapter = createGeminiTutorAnswerAdapter({
    client: createFakeClient(async () => ({
      text: undefined,
    })),
    invocationGateState: authorizedInvocationGateState,
    taskBudgets: authorizedTaskBudgets,
  });

  await assertRejects(
    () => adapter.invokeTutorAnswer(createInvocationInput()),
    caseId,
    "adapter did not reject an empty provider response",
  );
}

async function runInvalidChunkIdProducesHonestRefusalCase(): Promise<void> {
  const caseId = "tutor-gateway-invalid-chunk-id-produces-honest-refusal";

  const gateway = createGatewayWithClient(async () => ({
    text: JSON.stringify({
      answerText: "Answer.",
      citations: [{ chunkId: unknownChunkId, quote: "not in evidence" }],
    }),
  }));

  const response = await gateway.answerTutorQuery(createFakeQuery());

  assert(
    response.status === "refused",
    caseId,
    "an out-of-envelope chunkId must not escape as an uncaught exception",
  );
  assert(
    response.status === "refused" && response.reason === "invocation_failed",
    caseId,
    "refusal reason must honestly identify an invocation failure",
  );
  assert(
    response.status === "refused" &&
      !response.message.includes("chunkId") &&
      !response.message.includes("GeminiTutorAnswerAdapterError"),
    caseId,
    "refusal message must not leak adapter-internal detail",
  );
}

async function runEmptyCitationQuoteProducesHonestRefusalCase(): Promise<void> {
  const caseId = "tutor-gateway-empty-citation-quote-produces-honest-refusal";

  const gateway = createGatewayWithClient(async () => ({
    text: JSON.stringify({
      answerText: "Answer.",
      citations: [{ chunkId: knownChunkId, quote: "" }],
    }),
  }));

  const response = await gateway.answerTutorQuery(createFakeQuery());

  assert(
    response.status === "refused",
    caseId,
    "an empty citation quote must not escape as an uncaught exception",
  );
  assert(
    response.status === "refused" && response.reason === "invocation_failed",
    caseId,
    "refusal reason must honestly identify an invocation failure",
  );
}

async function runProviderFailureProducesSafeRefusalCase(): Promise<void> {
  const caseId = "tutor-gateway-provider-failure-produces-safe-refusal";

  const secretLookingDetail = "Authorization: Bearer FAKE_SECRET_TOKEN_0000";

  const gateway = createGatewayWithClient(async () => {
    throw new Error(`Gemini request failed: ${secretLookingDetail}`);
  });

  const response = await gateway.answerTutorQuery(createFakeQuery());

  assert(
    response.status === "refused",
    caseId,
    "a provider invocation failure must not escape as an uncaught exception",
  );
  assert(
    response.status === "refused" && response.reason === "invocation_failed",
    caseId,
    "refusal reason must honestly identify an invocation failure",
  );
  assert(
    response.status === "refused" &&
      !response.message.includes(secretLookingDetail) &&
      !response.message.includes("Bearer") &&
      !response.message.includes("FAKE_SECRET_TOKEN_0000"),
    caseId,
    "refusal message must not leak provider request/response detail",
  );
}

async function runValidCitationStillProducesSuccessfulAnswerCase(): Promise<void> {
  const caseId = "tutor-gateway-valid-citation-still-produces-successful-answer";

  const gateway = createGatewayWithClient(async () => ({
    text: JSON.stringify({
      answerText: "Mitosis proceeds through prophase, metaphase, anaphase, and telophase.",
      citations: [
        {
          chunkId: knownChunkId,
          quote: "Mitosis proceeds through prophase, metaphase, anaphase, and telophase.",
        },
      ],
    }),
  }));

  const response = await gateway.answerTutorQuery(createFakeQuery());

  assert(
    response.status === "answered",
    caseId,
    "a valid, resolvable citation must still produce a successful grounded answer",
  );
  assert(
    response.status === "answered" &&
      response.citations.length === 1 &&
      response.citations[0]?.resourceId === knownResourceId,
    caseId,
    "successful answer path must remain unchanged by the refusal-conversion fix",
  );
}

async function runNoToolsRemainStructurallyImpossibleCase(): Promise<void> {
  const caseId = "gemini-tutor-answer-adapter-no-tools-structurally-impossible";

  const routingConfig = resolveTutorAnswerRoutingConfig("standard");

  assert(
    !("tools" in routingConfig),
    caseId,
    "routing config must no longer carry a dead tools field",
  );

  let observedRequestKeys: readonly string[] = [];

  const adapter = createGeminiTutorAnswerAdapter({
    client: createFakeClient(async (requestInput) => {
      observedRequestKeys = Object.keys(requestInput);

      return {
        text: JSON.stringify({
          answerText: "Answer.",
          citations: [{ chunkId: knownChunkId, quote: "Mitosis proceeds" }],
        }),
      };
    }),
    invocationGateState: authorizedInvocationGateState,
    taskBudgets: authorizedTaskBudgets,
  });

  await adapter.invokeTutorAnswer(createInvocationInput());

  assert(
    !observedRequestKeys.includes("tools"),
    caseId,
    "provider request must never carry a tools field",
  );
}

async function runFailsClosedWhenInvocationGateStateMissingCase(): Promise<void> {
  const caseId = "gemini-tutor-answer-adapter-fails-closed-when-invocation-gate-state-missing";

  const adapter = createGeminiTutorAnswerAdapter({
    client: createNeverCalledClient(caseId),
    invocationGateState: undefined,
    taskBudgets: authorizedTaskBudgets,
  });

  await assertRejects(
    () => adapter.invokeTutorAnswer(createInvocationInput()),
    caseId,
    "adapter did not fail closed when the invocation gate state was not supplied",
  );
}

async function runFailsClosedWhenInvocationGateDisabledCase(): Promise<void> {
  const caseId = "gemini-tutor-answer-adapter-fails-closed-when-invocation-gate-disabled";

  const adapter = createGeminiTutorAnswerAdapter({
    client: createNeverCalledClient(caseId),
    invocationGateState: "disabled",
    taskBudgets: authorizedTaskBudgets,
  });

  await assertRejects(
    () => adapter.invokeTutorAnswer(createInvocationInput()),
    caseId,
    "adapter did not fail closed when the invocation gate was explicitly disabled",
  );
}

async function runFailsClosedWhenTaskBudgetsMissingCase(): Promise<void> {
  const caseId = "gemini-tutor-answer-adapter-fails-closed-when-task-budgets-missing";

  const adapter = createGeminiTutorAnswerAdapter({
    client: createNeverCalledClient(caseId),
    invocationGateState: authorizedInvocationGateState,
    taskBudgets: undefined,
  });

  await assertRejects(
    () => adapter.invokeTutorAnswer(createInvocationInput()),
    caseId,
    "adapter did not fail closed when task budget configuration was not supplied",
  );
}

async function runFailsClosedWhenBudgetCeilingExceededCase(): Promise<void> {
  const caseId = "gemini-tutor-answer-adapter-fails-closed-when-budget-ceiling-exceeded";

  const adapter = createGeminiTutorAnswerAdapter({
    client: createNeverCalledClient(caseId),
    invocationGateState: authorizedInvocationGateState,
    taskBudgets: {
      standard: { maxOutputTokens: 1 },
      high: { maxOutputTokens: 1 },
    },
  });

  await assertRejects(
    () => adapter.invokeTutorAnswer(createInvocationInput()),
    caseId,
    "adapter did not fail closed when the routing config's token requirement exceeded the configured budget ceiling",
  );
}

async function assertRejects(
  operation: () => Promise<unknown>,
  caseId: string,
  reason: string,
): Promise<void> {
  try {
    await operation();
  } catch {
    return;
  }

  throw new GeminiTutorAnswerAdapterContractFailure(caseId, reason);
}

async function main(): Promise<void> {
  await runResolvesCitationFromTrustedEnvelopeCase();
  await runSelectsRoutingConfigByQualityTierCase();
  await runNeverSendsResourceIdOrLocatorToProviderCase();
  await runRejectsMalformedJsonResponseCase();
  await runRejectsOutputContractViolationCase();
  await runRejectsUnresolvableCitationCase();
  await runRejectsEmptyResponseCase();
  await runInvalidChunkIdProducesHonestRefusalCase();
  await runEmptyCitationQuoteProducesHonestRefusalCase();
  await runProviderFailureProducesSafeRefusalCase();
  await runValidCitationStillProducesSuccessfulAnswerCase();
  await runNoToolsRemainStructurallyImpossibleCase();
  await runFailsClosedWhenInvocationGateStateMissingCase();
  await runFailsClosedWhenInvocationGateDisabledCase();
  await runFailsClosedWhenTaskBudgetsMissingCase();
  await runFailsClosedWhenBudgetCeilingExceededCase();
}

await main();
