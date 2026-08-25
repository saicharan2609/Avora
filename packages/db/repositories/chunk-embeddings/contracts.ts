import type { ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type { DbRetrievalChunkId } from "../chunks/index.js";

export type DbChunkEmbeddingStrategyVersion = string & {
  readonly __brand: "DbChunkEmbeddingStrategyVersion";
};

export type DbChunkEmbeddingRecord = Readonly<{
  chunkId: DbRetrievalChunkId;
  studentId: StudentId;
  resourceId: ResourceId;
  embeddingStrategyVersion: DbChunkEmbeddingStrategyVersion;
  vector: readonly number[];
  dimensions: number;
  contentHash: string;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}>;

export type WriteChunkEmbeddingInput = Readonly<{
  chunkId: DbRetrievalChunkId;
  studentId: StudentId;
  resourceId: ResourceId;
  embeddingStrategyVersion: DbChunkEmbeddingStrategyVersion;
  vector: readonly number[];
  dimensions: number;
  contentHash: string;
}>;

export type WriteChunkEmbeddingsInput = Readonly<{
  embeddings: readonly WriteChunkEmbeddingInput[];
}>;

export type WriteChunkEmbeddingsResult = Readonly<{
  writtenCount: number;
}>;

export type ListChunkEmbeddingsByResourceInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  embeddingStrategyVersion: DbChunkEmbeddingStrategyVersion;
}>;

export type ChunkEmbeddingsRepository = Readonly<{
  writeChunkEmbeddings: (
    input: WriteChunkEmbeddingsInput,
  ) => Promise<WriteChunkEmbeddingsResult>;
  listChunkEmbeddingsByResource: (
    input: ListChunkEmbeddingsByResourceInput,
  ) => Promise<readonly DbChunkEmbeddingRecord[]>;
}>;
