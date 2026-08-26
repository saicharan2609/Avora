import type { ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";
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
  createSummaryGateway,
  groundedSummaryContextEnvelopeVersion,
} from "../../../gateway/summary/index.js";
import type {
  GroundedSummaryContextEnvelope,
  SummaryQuery,
} from "../../../gateway/summary/index.js";
import type { SummaryInvocationInput } from "../../../gateway/invocation/index.js";
import { resolveSummaryRoutingConfig } from "../../../gateway/routing/SummaryRoutingPolicy.js";
import type {
  AiProviderInvocationGateState,
  SummaryGenerationTaskBudgets,
} from "../../../gateway/budget-gate/index.js";

import { createGeminiSummaryAdapter } from "../GeminiSummaryAdapter.js";
import type {
  GeminiSummaryClient,
  GeminiSummaryGenerateContentInput,
} from "../GeminiSummaryClient.js";

class GeminiSummaryAdapterContractFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "GeminiSummaryAdapterContractFailure";
  }
}

function assert(
  condition: boolean,
  caseId: string,
  reason: string,
): asserts condition {
  if (!condition) {
    throw new GeminiSummaryAdapterContractFailure(caseId, reason);
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

const authorizedTaskBudgets: SummaryGenerationTaskBudgets = {
  standard: { maxOutputTokens: 2048 },
};

function createNeverCalledClient(caseId: string): GeminiSummaryClient {
  return createFakeClient(async () => {
    throw new GeminiSummaryAdapterContractFailure(
      caseId,
      "provider client must not be called when authorization fails closed",
    );
  });
}

function createFakeQuery(): SummaryQuery {
  return {
    studentId: "student-0001" as StudentId,
    resourceId: knownResourceId,
    promptVersion: "summary-system-policy.v1",
    summaryStrategyVersion: "summary.generate.v1",
    requestedAt: "2026-08-14T03:30:00.000Z" as IsoDateTimeString,
  };
}

function createFakeEnvelope(): GroundedSummaryContextEnvelope {
  return {
    version: groundedSummaryContextEnvelopeVersion,
    query: createFakeQuery(),
    evidence: [
      {
        chunkId: knownChunkId,
        resourceId: knownResourceId,
        locator: knownLocator,
        text: "A linked list is a sequence of nodes, each pointing to the next.",
        sortOrder: 0,
      },
    ],
    allowedChunkIds: [knownChunkId],
  };
}

function createFakeClient(
  respond: (
    input: GeminiSummaryGenerateContentInput,
  ) => ReturnType<GeminiSummaryClient["generateContent"]>,
): GeminiSummaryClient {
  return {
    generateContent: respond,
  };
}

function createFullChunkRecord(): DbRetrievalChunkRecord {
  return {
    chunkId: knownChunkId,
    studentId: "student-0001" as StudentId,
    resourceId: knownResourceId,
    extractionDocumentId:
      "extraction-doc-0001" as DbRetrievalExtractionDocumentId,
    sourceBlockIds: [],
    scope: {
      termId: "term-0001",
      subjectId: "subject-0001",
      structureUnitId: "structure-unit-0001",
      resourceId: knownResourceId,
    },
    contentKind: "paragraph" as DbRetrievalChunkContentKind,
    text: "A linked list is a sequence of nodes, each pointing to the next.",
    tokenEstimate: 16,
    sanitisation: {
      status: "sanitised" as DbRetrievalChunkSanitisationStatus,
      strategyVersion: "sanitiser.v1" as DbRetrievalSanitisationStrategyVersion,
      warnings: [],
    },
    locator: knownLocator,
    sourceContentHash:
      "sha256:summary-adapter-contract-test-0000000000000000000000000001",
    chunkingStrategyVersion: "chunker.v1" as DbRetrievalChunkingStrategyVersion,
    status: "ready" as DbRetrievalChunkStatus,
    sortOrder: 0,
    createdAt: "2026-08-14T03:30:00.000Z" as IsoDateTimeString,
    updatedAt: "2026-08-14T03:30:00.000Z" as IsoDateTimeString,
  };
}

function createGatewayWithClient(
  respond: (
    input: GeminiSummaryGenerateContentInput,
  ) => ReturnType<GeminiSummaryClient["generateContent"]>,
) {
  return createSummaryGateway({
    chunkRetrieval: {
      listRetrievalChunksByResource: async () => [createFullChunkRecord()],
    },
    summaryInvocation: createGeminiSummaryAdapter({
      client: createFakeClient(respond),
      invocationGateState: authorizedInvocationGateState,
      taskBudgets: authorizedTaskBudgets,
    }),
    defaults: {
      minChunkCount: 1,
      qualityTier: "standard",
    },
  });
}

function createInvocationInput(
  overrides: Partial<SummaryInvocationInput> = {},
): SummaryInvocationInput {
  return {
    task: "summary.generate",
    qualityTier: "standard",
    query: createFakeQuery(),
    context: createFakeEnvelope(),
    ...overrides,
  };
}

function validSummaryOutput(): Readonly<{
  headings: readonly { title: string; points: readonly string[] }[];
  citations: readonly { chunkId: string; quote: string }[];
}> {
  return {
    headings: [
      {
        title: "Linked Lists",
        points: ["A linked list is a sequence of nodes, each pointing to the next."],
      },
    ],
    citations: [
      {
        chunkId: knownChunkId,
        quote: "A linked list is a sequence of nodes, each pointing to the next.",
      },
    ],
  };
}

async function runResolvesCitationFromTrustedEnvelopeCase(): Promise<void> {
  const caseId =
    "gemini-summary-adapter-resolves-citation-from-trusted-envelope";

  const adapter = createGeminiSummaryAdapter({
    client: createFakeClient(async () => ({
      text: JSON.stringify(validSummaryOutput()),
    })),
    invocationGateState: authorizedInvocationGateState,
    taskBudgets: authorizedTaskBudgets,
  });

  const result = await adapter.invokeSummaryGeneration(createInvocationInput());

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
  assert(
    result.candidate.modelVersion === "gemini-3.6-flash",
    caseId,
    "candidate did not carry the concrete routed model version (ENG-235)",
  );
}

async function runSelectsRoutingConfigForQualityTierCase(): Promise<void> {
  const caseId = "gemini-summary-adapter-selects-routing-config-for-quality-tier";

  const observedRequests: GeminiSummaryGenerateContentInput[] = [];

  const adapter = createGeminiSummaryAdapter({
    client: createFakeClient(async (requestInput) => {
      observedRequests.push(requestInput);

      return { text: JSON.stringify(validSummaryOutput()) };
    }),
    invocationGateState: authorizedInvocationGateState,
    taskBudgets: authorizedTaskBudgets,
  });

  await adapter.invokeSummaryGeneration(createInvocationInput());

  assert(observedRequests.length === 1, caseId, "expected one provider call");
  assert(
    observedRequests[0]?.model === "gemini-3.6-flash" &&
      observedRequests[0]?.maxOutputTokens === 2048,
    caseId,
    "standard quality tier did not route to the approved model configuration",
  );
  assert(
    observedRequests[0]?.responseMimeType === "application/json",
    caseId,
    "provider request did not request JSON output",
  );
}

async function runNeverSendsResourceIdOrLocatorToProviderCase(): Promise<void> {
  const caseId = "gemini-summary-adapter-never-sends-resource-id-or-locator";

  let capturedUserContentText: string | undefined;

  const adapter = createGeminiSummaryAdapter({
    client: createFakeClient(async (requestInput) => {
      capturedUserContentText = requestInput.userContentText;

      return { text: JSON.stringify(validSummaryOutput()) };
    }),
    invocationGateState: authorizedInvocationGateState,
    taskBudgets: authorizedTaskBudgets,
  });

  await adapter.invokeSummaryGeneration(createInvocationInput());

  assert(
    capturedUserContentText !== undefined,
    caseId,
    "provider was never called",
  );

  const dataPayload = JSON.parse(
    capturedUserContentText as string,
  ) as Readonly<{
    evidence: readonly Record<string, unknown>[];
  }>;

  assert(
    dataPayload.evidence.length === 1,
    caseId,
    "sealed evidence did not contain the expected single chunk",
  );
  assert(
    Object.keys(dataPayload.evidence[0] ?? {})
      .sort()
      .join(",") === "chunkId,text",
    caseId,
    "sealed evidence item exposed fields beyond chunkId and text to the provider",
  );
}

async function runRejectsMalformedJsonResponseCase(): Promise<void> {
  const caseId = "gemini-summary-adapter-rejects-malformed-json-response";

  const adapter = createGeminiSummaryAdapter({
    client: createFakeClient(async () => ({ text: "not valid json" })),
    invocationGateState: authorizedInvocationGateState,
    taskBudgets: authorizedTaskBudgets,
  });

  await assertRejects(
    () => adapter.invokeSummaryGeneration(createInvocationInput()),
    caseId,
    "adapter did not reject a non-JSON provider response",
  );
}

async function runRejectsOutputContractViolationCase(): Promise<void> {
  const caseId = "gemini-summary-adapter-rejects-output-contract-violation";

  const adapter = createGeminiSummaryAdapter({
    client: createFakeClient(async () => ({
      text: JSON.stringify({ headings: "not-an-array", citations: "not-an-array" }),
    })),
    invocationGateState: authorizedInvocationGateState,
    taskBudgets: authorizedTaskBudgets,
  });

  await assertRejects(
    () => adapter.invokeSummaryGeneration(createInvocationInput()),
    caseId,
    "adapter did not reject a provider response violating the output contract",
  );
}

async function runRejectsUnresolvableCitationCase(): Promise<void> {
  const caseId = "gemini-summary-adapter-rejects-unresolvable-citation";

  const adapter = createGeminiSummaryAdapter({
    client: createFakeClient(async () => ({
      text: JSON.stringify({
        headings: validSummaryOutput().headings,
        citations: [{ chunkId: unknownChunkId, quote: "not in evidence" }],
      }),
    })),
    invocationGateState: authorizedInvocationGateState,
    taskBudgets: authorizedTaskBudgets,
  });

  await assertRejects(
    () => adapter.invokeSummaryGeneration(createInvocationInput()),
    caseId,
    "adapter did not reject a citation referencing a chunkId outside the grounded context envelope",
  );
}

async function runRejectsEmptyResponseCase(): Promise<void> {
  const caseId = "gemini-summary-adapter-rejects-empty-response";

  const adapter = createGeminiSummaryAdapter({
    client: createFakeClient(async () => ({ text: undefined })),
    invocationGateState: authorizedInvocationGateState,
    taskBudgets: authorizedTaskBudgets,
  });

  await assertRejects(
    () => adapter.invokeSummaryGeneration(createInvocationInput()),
    caseId,
    "adapter did not reject an empty provider response",
  );
}

async function runInvalidChunkIdProducesHonestRefusalCase(): Promise<void> {
  const caseId = "summary-gateway-invalid-chunk-id-produces-honest-refusal";

  const gateway = createGatewayWithClient(async () => ({
    text: JSON.stringify({
      headings: validSummaryOutput().headings,
      citations: [{ chunkId: unknownChunkId, quote: "not in evidence" }],
    }),
  }));

  const response = await gateway.generateResourceSummary(createFakeQuery());

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
}

async function runEmptyCitationQuoteProducesHonestRefusalCase(): Promise<void> {
  const caseId = "summary-gateway-empty-citation-quote-produces-honest-refusal";

  const gateway = createGatewayWithClient(async () => ({
    text: JSON.stringify({
      headings: validSummaryOutput().headings,
      citations: [{ chunkId: knownChunkId, quote: "" }],
    }),
  }));

  const response = await gateway.generateResourceSummary(createFakeQuery());

  assert(
    response.status === "refused",
    caseId,
    "an empty citation quote must not escape as an uncaught exception",
  );
}

async function runProviderFailureProducesSafeRefusalCase(): Promise<void> {
  const caseId = "summary-gateway-provider-failure-produces-safe-refusal";

  const secretLookingDetail = "Authorization: Bearer FAKE_SECRET_TOKEN_0000";

  const gateway = createGatewayWithClient(async () => {
    throw new Error(`Gemini request failed: ${secretLookingDetail}`);
  });

  const response = await gateway.generateResourceSummary(createFakeQuery());

  assert(
    response.status === "refused",
    caseId,
    "a provider invocation failure must not escape as an uncaught exception",
  );
  assert(
    response.status === "refused" &&
      !response.message.includes(secretLookingDetail) &&
      !response.message.includes("Bearer"),
    caseId,
    "refusal message must not leak provider request/response detail",
  );
}

async function runValidCitationStillProducesSuccessfulSummaryCase(): Promise<void> {
  const caseId = "summary-gateway-valid-citation-still-produces-successful-summary";

  const gateway = createGatewayWithClient(async () => ({
    text: JSON.stringify(validSummaryOutput()),
  }));

  const response = await gateway.generateResourceSummary(createFakeQuery());

  assert(
    response.status === "generated",
    caseId,
    "a valid, resolvable citation must still produce a successful generated summary",
  );
  assert(
    response.status === "generated" &&
      response.citations.length === 1 &&
      response.citations[0]?.resourceId === knownResourceId,
    caseId,
    "successful summary path must carry through the resolved citation",
  );
  assert(
    response.status === "generated" && response.modelVersion === "gemini-3.6-flash",
    caseId,
    "successful summary path must carry through the concrete model version (ENG-235)",
  );
}

async function runFailsClosedWhenInvocationGateStateMissingCase(): Promise<void> {
  const caseId =
    "gemini-summary-adapter-fails-closed-when-invocation-gate-state-missing";

  const adapter = createGeminiSummaryAdapter({
    client: createNeverCalledClient(caseId),
    invocationGateState: undefined,
    taskBudgets: authorizedTaskBudgets,
  });

  await assertRejects(
    () => adapter.invokeSummaryGeneration(createInvocationInput()),
    caseId,
    "adapter did not fail closed when the invocation gate state was not supplied",
  );
}

async function runFailsClosedWhenInvocationGateDisabledCase(): Promise<void> {
  const caseId =
    "gemini-summary-adapter-fails-closed-when-invocation-gate-disabled";

  const adapter = createGeminiSummaryAdapter({
    client: createNeverCalledClient(caseId),
    invocationGateState: "disabled",
    taskBudgets: authorizedTaskBudgets,
  });

  await assertRejects(
    () => adapter.invokeSummaryGeneration(createInvocationInput()),
    caseId,
    "adapter did not fail closed when the invocation gate was explicitly disabled",
  );
}

async function runFailsClosedWhenTaskBudgetsMissingCase(): Promise<void> {
  const caseId =
    "gemini-summary-adapter-fails-closed-when-task-budgets-missing";

  const adapter = createGeminiSummaryAdapter({
    client: createNeverCalledClient(caseId),
    invocationGateState: authorizedInvocationGateState,
    taskBudgets: undefined,
  });

  await assertRejects(
    () => adapter.invokeSummaryGeneration(createInvocationInput()),
    caseId,
    "adapter did not fail closed when task budget configuration was not supplied",
  );
}

async function runFailsClosedWhenBudgetCeilingExceededCase(): Promise<void> {
  const caseId =
    "gemini-summary-adapter-fails-closed-when-budget-ceiling-exceeded";

  const adapter = createGeminiSummaryAdapter({
    client: createNeverCalledClient(caseId),
    invocationGateState: authorizedInvocationGateState,
    taskBudgets: {
      standard: { maxOutputTokens: 1 },
    },
  });

  await assertRejects(
    () => adapter.invokeSummaryGeneration(createInvocationInput()),
    caseId,
    "adapter did not fail closed when the routing config's token requirement exceeded the configured budget ceiling",
  );
}

async function runEmitsCostTelemetryOnSuccessfulInvocationCase(): Promise<void> {
  const caseId =
    "gemini-summary-adapter-emits-cost-telemetry-on-successful-invocation";

  const emittedTelemetry: unknown[] = [];

  const adapter = createGeminiSummaryAdapter({
    client: createFakeClient(async () => ({
      text: JSON.stringify(validSummaryOutput()),
    })),
    invocationGateState: authorizedInvocationGateState,
    taskBudgets: authorizedTaskBudgets,
    telemetrySink: (telemetry) => {
      emittedTelemetry.push(telemetry);
    },
  });

  await adapter.invokeSummaryGeneration(createInvocationInput());

  assert(
    emittedTelemetry.length === 1,
    caseId,
    "expected exactly one telemetry record emitted",
  );

  const record = emittedTelemetry[0] as {
    version: string;
    task: string;
    model: string;
    qualityTier: string;
    latencyMs: number;
    estimatedInputTokens: number;
    estimatedOutputTokens: number;
  };

  assert(record.version === "ai-cost-telemetry.v1", caseId, "telemetry version mismatch");
  assert(record.task === "summary.generate", caseId, "telemetry task mismatch");
  assert(record.model === "gemini-3.6-flash", caseId, "telemetry model mismatch");
  assert(record.qualityTier === "standard", caseId, "telemetry qualityTier mismatch");
  assert(record.latencyMs >= 0, caseId, "telemetry latencyMs must be non-negative");
  assert(
    record.estimatedInputTokens > 0,
    caseId,
    "telemetry estimatedInputTokens must be positive",
  );
  assert(
    record.estimatedOutputTokens > 0,
    caseId,
    "telemetry estimatedOutputTokens must be positive",
  );
}

async function runNoQualityTierOtherThanStandardExistsCase(): Promise<void> {
  const caseId = "gemini-summary-adapter-no-quality-tier-other-than-standard-exists";

  const routingConfig = resolveSummaryRoutingConfig("standard");

  assert(
    routingConfig.model === "gemini-3.6-flash",
    caseId,
    "standard quality tier must route to the approved mid-tier model configuration",
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

  throw new GeminiSummaryAdapterContractFailure(caseId, reason);
}

async function main(): Promise<void> {
  await runResolvesCitationFromTrustedEnvelopeCase();
  await runSelectsRoutingConfigForQualityTierCase();
  await runNeverSendsResourceIdOrLocatorToProviderCase();
  await runRejectsMalformedJsonResponseCase();
  await runRejectsOutputContractViolationCase();
  await runRejectsUnresolvableCitationCase();
  await runRejectsEmptyResponseCase();
  await runInvalidChunkIdProducesHonestRefusalCase();
  await runEmptyCitationQuoteProducesHonestRefusalCase();
  await runProviderFailureProducesSafeRefusalCase();
  await runValidCitationStillProducesSuccessfulSummaryCase();
  await runFailsClosedWhenInvocationGateStateMissingCase();
  await runFailsClosedWhenInvocationGateDisabledCase();
  await runFailsClosedWhenTaskBudgetsMissingCase();
  await runFailsClosedWhenBudgetCeilingExceededCase();
  await runEmitsCostTelemetryOnSuccessfulInvocationCase();
  await runNoQualityTierOtherThanStandardExistsCase();

  // eslint-disable-next-line no-console
  console.log("GeminiSummaryAdapter.contract: all cases passed");
}

await main();
