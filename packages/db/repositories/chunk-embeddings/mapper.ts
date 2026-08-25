import type { ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type { Database } from "../../generated/database.types.js";
import type { DbRetrievalChunkId } from "../chunks/index.js";
import type {
  DbChunkEmbeddingRecord,
  DbChunkEmbeddingStrategyVersion,
} from "./contracts.js";
import { ChunkEmbeddingsRepositoryError } from "./errors.js";

export function mapChunkEmbeddingRow(
  row: Database["public"]["Tables"]["chunk_embeddings"]["Row"],
): DbChunkEmbeddingRecord {
  return {
    chunkId: row.chunk_id as DbRetrievalChunkId,
    studentId: row.student_id as StudentId,
    resourceId: row.resource_id as ResourceId,
    embeddingStrategyVersion:
      row.embedding_strategy_version as DbChunkEmbeddingStrategyVersion,
    vector: parsePgvectorEmbedding(row.embedding),
    dimensions: row.dimensions,
    contentHash: row.content_hash,
    createdAt: row.created_at as IsoDateTimeString,
    updatedAt: row.updated_at as IsoDateTimeString,
  };
}

// PostgREST returns a pgvector column's wire text representation as a JSON
// string (e.g. "[0.1,0.2,...]"), not a JSON array, on SELECT.
function parsePgvectorEmbedding(embedding: string): readonly number[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(embedding);
  } catch {
    throw new ChunkEmbeddingsRepositoryError(
      "chunk_embeddings_repository_invalid_embedding_shape",
      "Chunk embedding row contained a malformed embedding value.",
    );
  }

  if (!Array.isArray(parsed) || !parsed.every((value) => typeof value === "number")) {
    throw new ChunkEmbeddingsRepositoryError(
      "chunk_embeddings_repository_invalid_embedding_shape",
      "Chunk embedding row did not decode to an array of numbers.",
    );
  }

  return parsed;
}
