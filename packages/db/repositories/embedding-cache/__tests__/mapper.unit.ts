import type { Database } from "../../../generated/database.types.js";
import { EmbeddingCacheRepositoryError } from "../errors.js";
import { mapEmbeddingCacheRow } from "../mapper.js";

class EmbeddingCacheMapperTestFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "EmbeddingCacheMapperTestFailure";
  }
}

function assert(condition: boolean, caseId: string, reason: string): asserts condition {
  if (!condition) {
    throw new EmbeddingCacheMapperTestFailure(caseId, reason);
  }
}

function buildRow(
  embedding: string,
): Database["public"]["Tables"]["embedding_cache"]["Row"] {
  return {
    content_hash: "sha256:test",
    embedding_strategy_version: "gemini-embedding-001.1536d.v1",
    embedding,
    dimensions: 1536,
    created_at: "2026-08-25T00:00:00.000Z",
  };
}

async function runParsesPgvectorWireStringIntoNumberArrayCase(): Promise<void> {
  const caseId = "embedding-cache-mapper-parses-pgvector-wire-string";
  const values = Array.from({ length: 1536 }, (_unused, index) => index * 0.001);
  const row = buildRow(JSON.stringify(values));

  const entry = mapEmbeddingCacheRow(row);

  assert(Array.isArray(entry.vector), caseId, "vector must be a real array, not the raw pgvector wire string");
  assert(entry.vector.length === 1536, caseId, `expected 1536 elements but got ${entry.vector.length}`);
  assert(
    entry.vector.every((value, index) => value === values[index]),
    caseId,
    "every numeric value must survive the round trip unchanged",
  );
}

async function runRejectsMalformedEmbeddingStringCase(): Promise<void> {
  const caseId = "embedding-cache-mapper-rejects-malformed-embedding-string";
  const row = buildRow("not valid json");

  try {
    mapEmbeddingCacheRow(row);
  } catch (error) {
    assert(
      error instanceof EmbeddingCacheRepositoryError
        && error.code === "embedding_cache_repository_invalid_embedding_shape",
      caseId,
      "expected a typed EmbeddingCacheRepositoryError with the invalid-embedding-shape code",
    );
    return;
  }

  throw new EmbeddingCacheMapperTestFailure(caseId, "expected mapEmbeddingCacheRow to throw");
}

async function runPreservesCacheKeyFieldsCase(): Promise<void> {
  const caseId = "embedding-cache-mapper-preserves-cache-key-fields";
  const row = buildRow(JSON.stringify([1, 2, 3]));

  const entry = mapEmbeddingCacheRow(row);

  assert(entry.contentHash === "sha256:test", caseId, "contentHash must round-trip unchanged");
  assert(
    String(entry.embeddingStrategyVersion) === "gemini-embedding-001.1536d.v1",
    caseId,
    "embeddingStrategyVersion must round-trip unchanged",
  );
}

export async function runEmbeddingCacheMapperUnitSuite(): Promise<void> {
  await runParsesPgvectorWireStringIntoNumberArrayCase();
  await runRejectsMalformedEmbeddingStringCase();
  await runPreservesCacheKeyFieldsCase();
}

await runEmbeddingCacheMapperUnitSuite();
