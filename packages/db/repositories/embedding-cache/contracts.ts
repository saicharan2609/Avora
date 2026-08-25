export type DbEmbeddingCacheStrategyVersion = string & {
  readonly __brand: "DbEmbeddingCacheStrategyVersion";
};

// Deliberately carries no studentId, resourceId, or chunkId (AD-30, ENG-238,
// SEC-322): a cache entry must never be attributable to any student.
export type DbEmbeddingCacheEntry = Readonly<{
  contentHash: string;
  embeddingStrategyVersion: DbEmbeddingCacheStrategyVersion;
  vector: readonly number[];
  dimensions: number;
}>;

export type EmbeddingCacheLookupKey = Readonly<{
  contentHash: string;
  embeddingStrategyVersion: DbEmbeddingCacheStrategyVersion;
}>;

export type GetCachedEmbeddingsInput = Readonly<{
  keys: readonly EmbeddingCacheLookupKey[];
}>;

export type GetCachedEmbeddingsResult = Readonly<{
  entries: readonly DbEmbeddingCacheEntry[];
}>;

export type PutCachedEmbeddingsInput = Readonly<{
  entries: readonly DbEmbeddingCacheEntry[];
}>;

export type EmbeddingCacheRepository = Readonly<{
  getCachedEmbeddings: (
    input: GetCachedEmbeddingsInput,
  ) => Promise<GetCachedEmbeddingsResult>;
  putCachedEmbeddings: (input: PutCachedEmbeddingsInput) => Promise<void>;
}>;
