import type { DatabaseClient } from "../../client/index.js";
import type {
  DbEmbeddingCacheEntry,
  EmbeddingCacheRepository,
  GetCachedEmbeddingsInput,
  GetCachedEmbeddingsResult,
  PutCachedEmbeddingsInput,
} from "./contracts.js";
import { EmbeddingCacheRepositoryError } from "./errors.js";
import { mapEmbeddingCacheRow } from "./mapper.js";

export type CreateEmbeddingCacheRepositoryInput = Readonly<{
  client: DatabaseClient;
}>;

const embeddingCacheSelectColumns =
  "content_hash,embedding_strategy_version,embedding,dimensions,created_at" as const;

export function createEmbeddingCacheRepository(
  input: CreateEmbeddingCacheRepositoryInput,
): EmbeddingCacheRepository {
  return {
    getCachedEmbeddings: async (
      lookup: GetCachedEmbeddingsInput,
    ): Promise<GetCachedEmbeddingsResult> => {
      if (lookup.keys.length === 0) {
        return { entries: [] };
      }

      const contentHashesByStrategyVersion = groupContentHashesByStrategyVersion(
        lookup.keys,
      );

      const entries: DbEmbeddingCacheEntry[] = [];

      for (const [embeddingStrategyVersion, contentHashes] of contentHashesByStrategyVersion) {
        const { data, error } = await input.client
          .from("embedding_cache")
          .select(embeddingCacheSelectColumns)
          .eq("embedding_strategy_version", embeddingStrategyVersion)
          .in("content_hash", contentHashes);

        if (error !== null) {
          throw new EmbeddingCacheRepositoryError(
            "embedding_cache_repository_read_failed",
            error.message,
          );
        }

        entries.push(...data.map(mapEmbeddingCacheRow));
      }

      return { entries };
    },

    putCachedEmbeddings: async (write: PutCachedEmbeddingsInput): Promise<void> => {
      for (const entry of write.entries) {
        assertValidCacheEntry(entry);
      }

      if (write.entries.length === 0) {
        return;
      }

      const { error } = await input.client
        .from("embedding_cache")
        .upsert(write.entries.map(mapCacheEntryToUpsertRow), {
          onConflict: "content_hash,embedding_strategy_version",
        });

      if (error !== null) {
        throw new EmbeddingCacheRepositoryError(
          "embedding_cache_repository_write_failed",
          error.message,
        );
      }
    },
  };
}

function groupContentHashesByStrategyVersion(
  keys: GetCachedEmbeddingsInput["keys"],
): ReadonlyMap<string, readonly string[]> {
  const grouped = new Map<string, string[]>();

  for (const key of keys) {
    const existing = grouped.get(key.embeddingStrategyVersion);

    if (existing === undefined) {
      grouped.set(key.embeddingStrategyVersion, [key.contentHash]);
    } else {
      existing.push(key.contentHash);
    }
  }

  return grouped;
}

function mapCacheEntryToUpsertRow(
  entry: DbEmbeddingCacheEntry,
): Readonly<{
  content_hash: string;
  embedding_strategy_version: string;
  embedding: number[];
  dimensions: number;
}> {
  return {
    content_hash: entry.contentHash,
    embedding_strategy_version: entry.embeddingStrategyVersion,
    embedding: [...entry.vector],
    dimensions: entry.dimensions,
  };
}

function assertValidCacheEntry(entry: DbEmbeddingCacheEntry): void {
  if (entry.contentHash.trim().length === 0) {
    throw new EmbeddingCacheRepositoryError(
      "embedding_cache_repository_invalid_entry",
      "Embedding cache entry requires a content hash.",
    );
  }

  if (entry.vector.length === 0) {
    throw new EmbeddingCacheRepositoryError(
      "embedding_cache_repository_invalid_entry",
      "Embedding cache entry requires a non-empty vector.",
    );
  }

  if (entry.dimensions !== entry.vector.length) {
    throw new EmbeddingCacheRepositoryError(
      "embedding_cache_repository_invalid_entry",
      "Embedding cache entry dimensions must match vector length.",
    );
  }

  if (entry.embeddingStrategyVersion.length === 0) {
    throw new EmbeddingCacheRepositoryError(
      "embedding_cache_repository_invalid_entry",
      "Embedding cache entry requires an embedding strategy version.",
    );
  }
}
