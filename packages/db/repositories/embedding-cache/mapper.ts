import type { Database } from "../../generated/database.types.js";
import type {
  DbEmbeddingCacheEntry,
  DbEmbeddingCacheStrategyVersion,
} from "./contracts.js";
import { EmbeddingCacheRepositoryError } from "./errors.js";

export function mapEmbeddingCacheRow(
  row: Database["public"]["Tables"]["embedding_cache"]["Row"],
): DbEmbeddingCacheEntry {
  return {
    contentHash: row.content_hash,
    embeddingStrategyVersion:
      row.embedding_strategy_version as DbEmbeddingCacheStrategyVersion,
    vector: parsePgvectorEmbedding(row.embedding),
    dimensions: row.dimensions,
  };
}

// PostgREST returns a pgvector column's wire text representation as a JSON
// string (e.g. "[0.1,0.2,...]"), not a JSON array, on SELECT.
function parsePgvectorEmbedding(embedding: string): readonly number[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(embedding);
  } catch {
    throw new EmbeddingCacheRepositoryError(
      "embedding_cache_repository_invalid_embedding_shape",
      "Embedding cache row contained a malformed embedding value.",
    );
  }

  if (!Array.isArray(parsed) || !parsed.every((value) => typeof value === "number")) {
    throw new EmbeddingCacheRepositoryError(
      "embedding_cache_repository_invalid_embedding_shape",
      "Embedding cache row did not decode to an array of numbers.",
    );
  }

  return parsed;
}
