import type {
  ChunkEmbeddingsRepository,
  DbChunkEmbeddingStrategyVersion,
} from "@avora/db/repositories/chunk-embeddings";

import type {
  ChunkEmbeddingRecord,
  EmbeddingIndexWriter,
  WriteChunkEmbeddingsInput,
  WriteChunkEmbeddingsResult,
} from "./contracts.js";

export type CreateSupabaseEmbeddingIndexWriterInput = Readonly<{
  chunkEmbeddingsRepository: ChunkEmbeddingsRepository;
}>;

export function createSupabaseEmbeddingIndexWriter(
  input: CreateSupabaseEmbeddingIndexWriterInput,
): EmbeddingIndexWriter {
  return {
    writeChunkEmbeddings: async (
      write: WriteChunkEmbeddingsInput,
    ): Promise<WriteChunkEmbeddingsResult> => {
      const result = await input.chunkEmbeddingsRepository.writeChunkEmbeddings({
        embeddings: write.chunks.map(mapChunkEmbeddingRecordToRepositoryInput),
      });

      return { writtenCount: result.writtenCount };
    },
  };
}

function mapChunkEmbeddingRecordToRepositoryInput(record: ChunkEmbeddingRecord) {
  return {
    chunkId: record.chunkId,
    studentId: record.studentId,
    resourceId: record.resourceId,
    embeddingStrategyVersion:
      record.embeddingStrategyVersion as unknown as DbChunkEmbeddingStrategyVersion,
    vector: record.vector,
    dimensions: record.dimensions,
    contentHash: record.contentHash,
  };
}
