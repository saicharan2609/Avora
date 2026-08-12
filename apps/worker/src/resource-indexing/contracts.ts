import type {
  EmbeddedText,
  EmbeddingPort,
  EmbeddingStrategyVersion,
} from "@avora/ai/embeddings";
import type {
  DbRetrievalChunkRecord,
  RetrievalChunkRepository,
} from "@avora/db/repositories/chunks";
import type {
  IndexResourceJob,
  IndexResourceJobPayload,
} from "@avora/retrieval/indexing";

export type ResourceIndexingWorkerInput = IndexResourceJobPayload;

export type ResourceIndexingWorkerResult = Readonly<{
  studentId: IndexResourceJobPayload["studentId"];
  resourceId: IndexResourceJobPayload["resourceId"];
  embeddingStrategyVersion: IndexResourceJobPayload["embeddingStrategyVersion"];
  chunkCount: number;
  embeddedChunkCount: number;
  skippedReason: "no_ready_chunks" | null;
}>;

export type ChunkEmbeddingRecord = Readonly<{
  chunkId: DbRetrievalChunkRecord["chunkId"];
  studentId: DbRetrievalChunkRecord["studentId"];
  resourceId: DbRetrievalChunkRecord["resourceId"];
  embeddingStrategyVersion: EmbeddingStrategyVersion;
  contentHash: string;
  vector: EmbeddedText["vector"];
  dimensions: number;
}>;

export type WriteChunkEmbeddingsInput = Readonly<{
  studentId: IndexResourceJobPayload["studentId"];
  resourceId: IndexResourceJobPayload["resourceId"];
  embeddingStrategyVersion: EmbeddingStrategyVersion;
  chunks: readonly ChunkEmbeddingRecord[];
}>;

export type WriteChunkEmbeddingsResult = Readonly<{
  writtenCount: number;
}>;

export type EmbeddingIndexWriter = Readonly<{
  writeChunkEmbeddings: (
    input: WriteChunkEmbeddingsInput,
  ) => Promise<WriteChunkEmbeddingsResult>;
}>;

export type ResourceIndexingWorkerDependencies = Readonly<{
  retrievalChunkRepository: Pick<
    RetrievalChunkRepository,
    "listRetrievalChunksByResource"
  >;
  embeddingPort: EmbeddingPort;
  embeddingIndexWriter: EmbeddingIndexWriter;
}>;

export type ResourceIndexingWorkerJob = IndexResourceJob;