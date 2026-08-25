import {
  createContentAddressedEmbeddingPort,
} from "../ContentAddressedEmbeddingPort.js";
import { ContentAddressedEmbeddingPortError } from "../ContentAddressedEmbeddingPort.errors.js";
import type { EmbeddingCacheEntry, EmbeddingCachePort } from "../EmbeddingCachePort.js";
import type {
  EmbedTextsInput,
  EmbeddedText,
  EmbeddingInputId,
  EmbeddingPort,
  EmbeddingStrategyVersion,
} from "../EmbeddingPort.js";

class ContentAddressedEmbeddingPortContractFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "ContentAddressedEmbeddingPortContractFailure";
  }
}

function assert(condition: boolean, caseId: string, reason: string): asserts condition {
  if (!condition) {
    throw new ContentAddressedEmbeddingPortContractFailure(caseId, reason);
  }
}

const strategyVersion = "test-strategy.v1" as EmbeddingStrategyVersion;

function createFakeInner(
  embed: (input: EmbedTextsInput) => Promise<readonly EmbeddedText[]>,
): EmbeddingPort {
  return {
    embedTexts: async (input) => ({
      strategyVersion: input.strategyVersion,
      embeddings: await embed(input),
    }),
  };
}

function createNeverCalledInner(caseId: string): EmbeddingPort {
  return createFakeInner(async () => {
    throw new ContentAddressedEmbeddingPortContractFailure(
      caseId,
      "inner embedding port must not be called when every input is a cache hit",
    );
  });
}

function createFakeCache(overrides: Partial<EmbeddingCachePort> = {}): EmbeddingCachePort & {
  readonly getCalls: ReadonlyArray<Parameters<EmbeddingCachePort["getCachedEmbeddings"]>[0]>;
  readonly putCalls: ReadonlyArray<Parameters<EmbeddingCachePort["putCachedEmbeddings"]>[0]>;
} {
  const getCalls: Array<Parameters<EmbeddingCachePort["getCachedEmbeddings"]>[0]> = [];
  const putCalls: Array<Parameters<EmbeddingCachePort["putCachedEmbeddings"]>[0]> = [];
  const store = new Map<string, EmbeddingCacheEntry>();

  return {
    getCalls,
    putCalls,
    getCachedEmbeddings: async (input) => {
      getCalls.push(input);

      if (overrides.getCachedEmbeddings !== undefined) {
        return overrides.getCachedEmbeddings(input);
      }

      const entries = input.keys
        .map((key) => store.get(key.contentHash))
        .filter((entry): entry is EmbeddingCacheEntry => entry !== undefined);

      return { entries };
    },
    putCachedEmbeddings: async (input) => {
      putCalls.push(input);

      if (overrides.putCachedEmbeddings !== undefined) {
        await overrides.putCachedEmbeddings(input);
        return;
      }

      for (const entry of input.entries) {
        store.set(entry.contentHash, entry);
      }
    },
  };
}

async function runAllCacheHitsSkipsInnerPortCase(): Promise<void> {
  const caseId = "content-addressed-embedding-port-all-cache-hits-skips-inner";

  const cache = createFakeCache();
  await cache.putCachedEmbeddings({
    entries: [
      { contentHash: "hash-1", embeddingStrategyVersion: strategyVersion, vector: [0.1, 0.2], dimensions: 2 },
    ],
  });

  const port = createContentAddressedEmbeddingPort({
    inner: createNeverCalledInner(caseId),
    cache,
  });

  const result = await port.embedTexts({
    strategyVersion,
    inputs: [
      {
        id: "input-1" as EmbeddingInputId,
        text: "cached text",
        contentHash: "hash-1",
        metadata: { studentId: "s-1", resourceId: "r-1", chunkId: "c-1" },
      },
    ],
  });

  assert(result.embeddings.length === 1, caseId, "expected exactly one embedding");
  assert(
    result.embeddings[0]?.vector[0] === 0.1,
    caseId,
    "expected the cached vector to be returned",
  );
}

async function runCacheMissCallsInnerAndWritesThroughCase(): Promise<void> {
  const caseId = "content-addressed-embedding-port-cache-miss-calls-inner-and-writes-through";

  const cache = createFakeCache();

  const port = createContentAddressedEmbeddingPort({
    inner: createFakeInner(async (input) =>
      input.inputs.map((textInput): EmbeddedText => ({
        id: textInput.id,
        vector: [1, 2, 3],
        dimensions: 3,
        contentHash: textInput.contentHash,
        embeddingStrategyVersion: input.strategyVersion,
      })),
    ),
    cache,
  });

  const result = await port.embedTexts({
    strategyVersion,
    inputs: [
      {
        id: "input-1" as EmbeddingInputId,
        text: "uncached text",
        contentHash: "hash-2",
        metadata: { studentId: "s-1", resourceId: "r-1", chunkId: "c-1" },
      },
    ],
  });

  assert(result.embeddings.length === 1, caseId, "expected exactly one embedding");
  assert(cache.putCalls.length === 1, caseId, "expected the cache miss to be written through");
  assert(
    cache.putCalls[0]?.entries[0]?.contentHash === "hash-2",
    caseId,
    "expected the write-through entry to carry the requested content hash",
  );

  const secondLookup = await cache.getCachedEmbeddings({
    keys: [{ contentHash: "hash-2", embeddingStrategyVersion: strategyVersion }],
  });

  assert(
    secondLookup.entries.length === 1,
    caseId,
    "expected a subsequent lookup to now observe the cached entry",
  );
}

async function runMixedHitsAndMissesPreserveOrderCase(): Promise<void> {
  const caseId = "content-addressed-embedding-port-mixed-hits-and-misses-preserve-order";

  const cache = createFakeCache();
  await cache.putCachedEmbeddings({
    entries: [
      { contentHash: "hash-a", embeddingStrategyVersion: strategyVersion, vector: [9], dimensions: 1 },
    ],
  });

  const port = createContentAddressedEmbeddingPort({
    inner: createFakeInner(async (input) =>
      input.inputs.map((textInput): EmbeddedText => ({
        id: textInput.id,
        vector: [7],
        dimensions: 1,
        contentHash: textInput.contentHash,
        embeddingStrategyVersion: input.strategyVersion,
      })),
    ),
    cache,
  });

  const result = await port.embedTexts({
    strategyVersion,
    inputs: [
      {
        id: "input-1" as EmbeddingInputId,
        text: "miss",
        contentHash: "hash-b",
        metadata: { studentId: "s-1", resourceId: "r-1", chunkId: "c-1" },
      },
      {
        id: "input-2" as EmbeddingInputId,
        text: "hit",
        contentHash: "hash-a",
        metadata: { studentId: "s-1", resourceId: "r-1", chunkId: "c-2" },
      },
    ],
  });

  assert(
    result.embeddings[0]?.id === "input-1" && result.embeddings[1]?.id === "input-2",
    caseId,
    "expected results ordered by the originally requested input order, not hit/miss order",
  );
  assert(result.embeddings[0]?.vector[0] === 7, caseId, "expected the miss to carry the fresh vector");
  assert(result.embeddings[1]?.vector[0] === 9, caseId, "expected the hit to carry the cached vector");
}

async function runCacheReadFailureThrowsTypedErrorCase(): Promise<void> {
  const caseId = "content-addressed-embedding-port-cache-read-failure-throws-typed-error";

  const cache = createFakeCache({
    getCachedEmbeddings: async () => {
      throw new Error("cache unavailable");
    },
  });

  const port = createContentAddressedEmbeddingPort({
    inner: createNeverCalledInner(caseId),
    cache,
  });

  await assertRejectsWithCode(
    () =>
      port.embedTexts({
        strategyVersion,
        inputs: [
          {
            id: "input-1" as EmbeddingInputId,
            text: "text",
            contentHash: "hash-x",
            metadata: { studentId: "s-1", resourceId: "r-1", chunkId: "c-1" },
          },
        ],
      }),
    "content_addressed_embedding_port_cache_read_failed",
    caseId,
    "expected a cache read failure to surface as a typed error, not swallow silently",
  );
}

async function runCacheWriteFailureThrowsTypedErrorCase(): Promise<void> {
  const caseId = "content-addressed-embedding-port-cache-write-failure-throws-typed-error";

  const cache = createFakeCache({
    putCachedEmbeddings: async () => {
      throw new Error("cache write unavailable");
    },
  });

  const port = createContentAddressedEmbeddingPort({
    inner: createFakeInner(async (input) =>
      input.inputs.map((textInput): EmbeddedText => ({
        id: textInput.id,
        vector: [1],
        dimensions: 1,
        contentHash: textInput.contentHash,
        embeddingStrategyVersion: input.strategyVersion,
      })),
    ),
    cache,
  });

  await assertRejectsWithCode(
    () =>
      port.embedTexts({
        strategyVersion,
        inputs: [
          {
            id: "input-1" as EmbeddingInputId,
            text: "text",
            contentHash: "hash-y",
            metadata: { studentId: "s-1", resourceId: "r-1", chunkId: "c-1" },
          },
        ],
      }),
    "content_addressed_embedding_port_cache_write_failed",
    caseId,
    "expected a cache write failure to surface as a typed error, not swallow silently",
  );
}

async function assertRejectsWithCode(
  operation: () => Promise<unknown>,
  expectedCode: string,
  caseId: string,
  reason: string,
): Promise<void> {
  try {
    await operation();
  } catch (error) {
    if (error instanceof ContentAddressedEmbeddingPortError && error.code === expectedCode) {
      return;
    }

    throw new ContentAddressedEmbeddingPortContractFailure(
      caseId,
      `${reason} (received: ${String(error)})`,
    );
  }

  throw new ContentAddressedEmbeddingPortContractFailure(caseId, reason);
}

async function main(): Promise<void> {
  await runAllCacheHitsSkipsInnerPortCase();
  await runCacheMissCallsInnerAndWritesThroughCase();
  await runMixedHitsAndMissesPreserveOrderCase();
  await runCacheReadFailureThrowsTypedErrorCase();
  await runCacheWriteFailureThrowsTypedErrorCase();
}

await main();
