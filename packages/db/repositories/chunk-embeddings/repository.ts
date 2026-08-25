import type { DatabaseClient } from "../../client/index.js";
import type {
  ChunkEmbeddingsRepository,
  DbChunkEmbeddingRecord,
  ListChunkEmbeddingsByResourceInput,
  WriteChunkEmbeddingInput,
  WriteChunkEmbeddingsInput,
  WriteChunkEmbeddingsResult,
} from "./contracts.js";
import { ChunkEmbeddingsRepositoryError } from "./errors.js";
import { mapChunkEmbeddingRow } from "./mapper.js";

export type CreateChunkEmbeddingsRepositoryInput = Readonly<{
  client: DatabaseClient;
}>;

const chunkEmbeddingSelectColumns =
  "chunk_id,student_id,resource_id,embedding_strategy_version,embedding,dimensions,content_hash,created_at,updated_at" as const;

export function createChunkEmbeddingsRepository(
  input: CreateChunkEmbeddingsRepositoryInput,
): ChunkEmbeddingsRepository {
  return {
    writeChunkEmbeddings: async (
      write: WriteChunkEmbeddingsInput,
    ): Promise<WriteChunkEmbeddingsResult> => {
      for (const embedding of write.embeddings) {
        assertValidEmbeddingInput(embedding);
      }

      if (write.embeddings.length === 0) {
        return { writtenCount: 0 };
      }

      const { data, error } = await input.client
        .from("chunk_embeddings")
        .upsert(write.embeddings.map(mapWriteInputToUpsertRow), {
          onConflict: "chunk_id,embedding_strategy_version",
        })
        .select(chunkEmbeddingSelectColumns);

      if (error !== null) {
        throw new ChunkEmbeddingsRepositoryError(
          "chunk_embeddings_repository_write_failed",
          error.message,
        );
      }

      return { writtenCount: data.length };
    },

    listChunkEmbeddingsByResource: async (
      lookup: ListChunkEmbeddingsByResourceInput,
    ): Promise<readonly DbChunkEmbeddingRecord[]> => {
      const { data, error } = await input.client
        .from("chunk_embeddings")
        .select(chunkEmbeddingSelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("resource_id", lookup.resourceId)
        .eq("embedding_strategy_version", lookup.embeddingStrategyVersion);

      if (error !== null) {
        throw new ChunkEmbeddingsRepositoryError(
          "chunk_embeddings_repository_read_failed",
          error.message,
        );
      }

      return data.map(mapChunkEmbeddingRow);
    },
  };
}

function mapWriteInputToUpsertRow(
  embedding: WriteChunkEmbeddingInput,
): Readonly<{
  chunk_id: string;
  student_id: string;
  resource_id: string;
  embedding_strategy_version: string;
  embedding: number[];
  dimensions: number;
  content_hash: string;
}> {
  return {
    chunk_id: embedding.chunkId,
    student_id: embedding.studentId,
    resource_id: embedding.resourceId,
    embedding_strategy_version: embedding.embeddingStrategyVersion,
    embedding: [...embedding.vector],
    dimensions: embedding.dimensions,
    content_hash: embedding.contentHash,
  };
}

function assertValidEmbeddingInput(input: WriteChunkEmbeddingInput): void {
  if (input.vector.length === 0) {
    throw new ChunkEmbeddingsRepositoryError(
      "chunk_embeddings_repository_invalid_embedding",
      "Chunk embedding requires a non-empty vector.",
    );
  }

  if (input.dimensions !== input.vector.length) {
    throw new ChunkEmbeddingsRepositoryError(
      "chunk_embeddings_repository_invalid_embedding",
      "Chunk embedding dimensions must match vector length.",
    );
  }

  if (input.embeddingStrategyVersion.length === 0) {
    throw new ChunkEmbeddingsRepositoryError(
      "chunk_embeddings_repository_invalid_embedding",
      "Chunk embedding requires an embedding strategy version.",
    );
  }

  if (input.contentHash.trim().length === 0) {
    throw new ChunkEmbeddingsRepositoryError(
      "chunk_embeddings_repository_invalid_embedding",
      "Chunk embedding requires a content hash.",
    );
  }
}
