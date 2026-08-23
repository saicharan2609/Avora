import type {
  EmbeddingInputId,
} from "../../../embeddings/index.js";
import type {
  AiProviderInvocationGateState,
} from "../../../gateway/budget-gate/index.js";
import {
  createGeminiEmbeddingPort,
} from "../GeminiEmbeddingAdapter.js";
import {
  geminiEmbeddingOutputDimensions,
  geminiEmbeddingStrategyVersion,
} from "../GeminiEmbeddingModel.js";
import type {
  GeminiEmbeddingClient,
} from "../GeminiEmbeddingClient.js";

class GeminiEmbeddingAdapterContractFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "GeminiEmbeddingAdapterContractFailure";
  }
}

function assert(condition: boolean, caseId: string, reason: string): asserts condition {
  if (!condition) {
    throw new GeminiEmbeddingAdapterContractFailure(caseId, reason);
  }
}

const authorizedInvocationGateState: AiProviderInvocationGateState = "enabled";

function createFakeClient(
  respond: (input: Parameters<GeminiEmbeddingClient["embedContent"]>[0]) =>
    ReturnType<GeminiEmbeddingClient["embedContent"]>,
): GeminiEmbeddingClient {
  return {
    embedContent: respond,
  };
}

function createNeverCalledClient(caseId: string): GeminiEmbeddingClient {
  return createFakeClient(async () => {
    throw new GeminiEmbeddingAdapterContractFailure(
      caseId,
      "provider client must not be called when authorization fails closed",
    );
  });
}

async function runEmbedsRequestedTextsCase(): Promise<void> {
  const caseId = "gemini-embedding-adapter-embeds-requested-texts";
  let observedModel: string | undefined;
  let observedDimensions: number | undefined;

  const port = createGeminiEmbeddingPort({
    client: createFakeClient(async (input) => {
      observedModel = input.model;
      observedDimensions = input.outputDimensionality;

      return {
        embeddings: input.contents.map((_text, index) => ({
          values: [index + 0.1, index + 0.2, index + 0.3],
        })),
      };
    }),
    invocationGateState: authorizedInvocationGateState,
  });

  const result = await port.embedTexts({
    strategyVersion: geminiEmbeddingStrategyVersion,
    inputs: [
      {
        id: "input-1" as EmbeddingInputId,
        text: "Photosynthesis converts light energy into chemical energy.",
        contentHash: "sha256:contract-test-0000000000000000000000000000000000000000000000000001",
        metadata: {
          studentId: "student-1",
          resourceId: "resource-1",
          chunkId: "chunk-1",
        },
      },
      {
        id: "input-2" as EmbeddingInputId,
        text: "Mitochondria are the powerhouse of the cell.",
        contentHash: "sha256:contract-test-0000000000000000000000000000000000000000000000000002",
        metadata: {
          studentId: "student-1",
          resourceId: "resource-1",
          chunkId: "chunk-2",
        },
      },
    ],
  });

  assert(observedModel !== undefined, caseId, "client was not invoked with a model");
  assert(
    observedDimensions === geminiEmbeddingOutputDimensions,
    caseId,
    "client was not invoked with the configured output dimensionality",
  );
  assert(
    result.embeddings.length === 2,
    caseId,
    "result did not contain one embedding per requested input",
  );
  assert(
    result.embeddings[0]?.id === "input-1" && result.embeddings[1]?.id === "input-2",
    caseId,
    "result embeddings were not returned in requested order",
  );
  assert(
    result.embeddings.every((embedding) => embedding.dimensions === embedding.vector.length),
    caseId,
    "reported dimensions did not match returned vector length",
  );
  assert(
    result.strategyVersion === geminiEmbeddingStrategyVersion,
    caseId,
    "result strategy version did not match the adapter's declared strategy version",
  );
}

async function runRejectsUnsupportedStrategyVersionCase(): Promise<void> {
  const caseId = "gemini-embedding-adapter-rejects-unsupported-strategy-version";

  const port = createGeminiEmbeddingPort({
    client: createFakeClient(async () => {
      throw new GeminiEmbeddingAdapterContractFailure(
        caseId,
        "provider client must not be called for an unsupported strategy version",
      );
    }),
    invocationGateState: authorizedInvocationGateState,
  });

  await assertRejects(
    () =>
      port.embedTexts({
        strategyVersion: "some-other-strategy.v1" as never,
        inputs: [
          {
            id: "input-1" as EmbeddingInputId,
            text: "text",
            contentHash: "sha256:contract-test-0000000000000000000000000000000000000000000000000003",
            metadata: { studentId: "student-1", resourceId: "resource-1", chunkId: "chunk-1" },
          },
        ],
      }),
    caseId,
    "embedTexts did not reject an unsupported strategy version",
  );
}

async function runRejectsMissingVectorCase(): Promise<void> {
  const caseId = "gemini-embedding-adapter-rejects-missing-vector";

  const port = createGeminiEmbeddingPort({
    client: createFakeClient(async (input) => ({
      embeddings: input.contents.map(() => ({ values: undefined })),
    })),
    invocationGateState: authorizedInvocationGateState,
  });

  await assertRejects(
    () =>
      port.embedTexts({
        strategyVersion: geminiEmbeddingStrategyVersion,
        inputs: [
          {
            id: "input-1" as EmbeddingInputId,
            text: "text",
            contentHash: "sha256:contract-test-0000000000000000000000000000000000000000000000000004",
            metadata: { studentId: "student-1", resourceId: "resource-1", chunkId: "chunk-1" },
          },
        ],
      }),
    caseId,
    "embedTexts did not reject a provider response missing a vector",
  );
}

async function runRejectsResultCountMismatchCase(): Promise<void> {
  const caseId = "gemini-embedding-adapter-rejects-result-count-mismatch";

  const port = createGeminiEmbeddingPort({
    client: createFakeClient(async () => ({
      embeddings: [{ values: [0.1, 0.2] }],
    })),
    invocationGateState: authorizedInvocationGateState,
  });

  await assertRejects(
    () =>
      port.embedTexts({
        strategyVersion: geminiEmbeddingStrategyVersion,
        inputs: [
          {
            id: "input-1" as EmbeddingInputId,
            text: "text one",
            contentHash: "sha256:contract-test-0000000000000000000000000000000000000000000000000005",
            metadata: { studentId: "student-1", resourceId: "resource-1", chunkId: "chunk-1" },
          },
          {
            id: "input-2" as EmbeddingInputId,
            text: "text two",
            contentHash: "sha256:contract-test-0000000000000000000000000000000000000000000000000006",
            metadata: { studentId: "student-1", resourceId: "resource-1", chunkId: "chunk-2" },
          },
        ],
      }),
    caseId,
    "embedTexts did not reject a provider response with a mismatched embedding count",
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

  throw new GeminiEmbeddingAdapterContractFailure(caseId, reason);
}

async function runFailsClosedWhenInvocationGateStateMissingCase(): Promise<void> {
  const caseId = "gemini-embedding-adapter-fails-closed-when-invocation-gate-state-missing";

  const port = createGeminiEmbeddingPort({
    client: createNeverCalledClient(caseId),
    invocationGateState: undefined,
  });

  await assertRejects(
    () =>
      port.embedTexts({
        strategyVersion: geminiEmbeddingStrategyVersion,
        inputs: [
          {
            id: "input-1" as EmbeddingInputId,
            text: "text",
            contentHash: "sha256:contract-test-0000000000000000000000000000000000000000000000000007",
            metadata: { studentId: "student-1", resourceId: "resource-1", chunkId: "chunk-1" },
          },
        ],
      }),
    caseId,
    "adapter did not fail closed when the invocation gate state was not supplied",
  );
}

async function runFailsClosedWhenInvocationGateDisabledCase(): Promise<void> {
  const caseId = "gemini-embedding-adapter-fails-closed-when-invocation-gate-disabled";

  const port = createGeminiEmbeddingPort({
    client: createNeverCalledClient(caseId),
    invocationGateState: "disabled",
  });

  await assertRejects(
    () =>
      port.embedTexts({
        strategyVersion: geminiEmbeddingStrategyVersion,
        inputs: [
          {
            id: "input-1" as EmbeddingInputId,
            text: "text",
            contentHash: "sha256:contract-test-0000000000000000000000000000000000000000000000000008",
            metadata: { studentId: "student-1", resourceId: "resource-1", chunkId: "chunk-1" },
          },
        ],
      }),
    caseId,
    "adapter did not fail closed when the invocation gate was explicitly disabled",
  );
}

async function main(): Promise<void> {
  await runEmbedsRequestedTextsCase();
  await runRejectsUnsupportedStrategyVersionCase();
  await runRejectsMissingVectorCase();
  await runRejectsResultCountMismatchCase();
  await runFailsClosedWhenInvocationGateStateMissingCase();
  await runFailsClosedWhenInvocationGateDisabledCase();
}

await main();
