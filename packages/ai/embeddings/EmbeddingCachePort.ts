import type { EmbeddingStrategyVersion, EmbeddingVector } from "./EmbeddingPort.js";

// Deliberately carries no studentId, resourceId, or chunkId (AD-30, ENG-238,
// SEC-322): a cache entry must never be attributable to any student. Cache
// lookups and writes are keyed only by contentHash and strategyVersion.
export type EmbeddingCacheEntry = Readonly<{
  contentHash: string;
  embeddingStrategyVersion: EmbeddingStrategyVersion;
  vector: EmbeddingVector;
  dimensions: number;
}>;

export type EmbeddingCacheLookupKey = Readonly<{
  contentHash: string;
  embeddingStrategyVersion: EmbeddingStrategyVersion;
}>;

export type GetCachedEmbeddingsInput = Readonly<{
  keys: readonly EmbeddingCacheLookupKey[];
}>;

export type GetCachedEmbeddingsResult = Readonly<{
  entries: readonly EmbeddingCacheEntry[];
}>;

export type PutCachedEmbeddingsInput = Readonly<{
  entries: readonly EmbeddingCacheEntry[];
}>;

export type EmbeddingCachePort = Readonly<{
  getCachedEmbeddings: (
    input: GetCachedEmbeddingsInput,
  ) => Promise<GetCachedEmbeddingsResult>;
  putCachedEmbeddings: (input: PutCachedEmbeddingsInput) => Promise<void>;
}>;
