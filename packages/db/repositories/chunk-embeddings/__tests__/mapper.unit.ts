import type { Database } from "../../../generated/database.types.js";
import { ChunkEmbeddingsRepositoryError } from "../errors.js";
import { mapChunkEmbeddingRow } from "../mapper.js";

class ChunkEmbeddingsMapperTestFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "ChunkEmbeddingsMapperTestFailure";
  }
}

function assert(condition: boolean, caseId: string, reason: string): asserts condition {
  if (!condition) {
    throw new ChunkEmbeddingsMapperTestFailure(caseId, reason);
  }
}

function buildRow(
  embedding: string,
): Database["public"]["Tables"]["chunk_embeddings"]["Row"] {
  return {
    chunk_id: "a0000000-0000-4000-8000-000000000031",
    student_id: "a0000000-0000-4000-8000-000000000001",
    resource_id: "a0000000-0000-4000-8000-000000000011",
    embedding_strategy_version: "gemini-embedding-001.1536d.v1",
    embedding,
    dimensions: 1536,
    content_hash: "sha256:test",
    created_at: "2026-08-25T00:00:00.000Z",
    updated_at: "2026-08-25T00:00:00.000Z",
  };
}

async function runParsesPgvectorWireStringIntoNumberArrayCase(): Promise<void> {
  const caseId = "chunk-embeddings-mapper-parses-pgvector-wire-string";
  const values = Array.from({ length: 1536 }, (_unused, index) => index * 0.001);
  const row = buildRow(JSON.stringify(values));

  const record = mapChunkEmbeddingRow(row);

  assert(Array.isArray(record.vector), caseId, "vector must be a real array, not the raw pgvector wire string");
  assert(record.vector.length === 1536, caseId, `expected 1536 elements but got ${record.vector.length}`);
  assert(
    record.vector.every((value, index) => value === values[index]),
    caseId,
    "every numeric value must survive the round trip unchanged",
  );
}

async function runRejectsMalformedEmbeddingStringCase(): Promise<void> {
  const caseId = "chunk-embeddings-mapper-rejects-malformed-embedding-string";
  const row = buildRow("not valid json");

  try {
    mapChunkEmbeddingRow(row);
  } catch (error) {
    assert(
      error instanceof ChunkEmbeddingsRepositoryError
        && error.code === "chunk_embeddings_repository_invalid_embedding_shape",
      caseId,
      "expected a typed ChunkEmbeddingsRepositoryError with the invalid-embedding-shape code",
    );
    return;
  }

  throw new ChunkEmbeddingsMapperTestFailure(caseId, "expected mapChunkEmbeddingRow to throw");
}

async function runRejectsNonNumericArrayCase(): Promise<void> {
  const caseId = "chunk-embeddings-mapper-rejects-non-numeric-array";
  const row = buildRow(JSON.stringify(["not", "numbers"]));

  try {
    mapChunkEmbeddingRow(row);
  } catch (error) {
    assert(
      error instanceof ChunkEmbeddingsRepositoryError
        && error.code === "chunk_embeddings_repository_invalid_embedding_shape",
      caseId,
      "expected a typed ChunkEmbeddingsRepositoryError with the invalid-embedding-shape code",
    );
    return;
  }

  throw new ChunkEmbeddingsMapperTestFailure(caseId, "expected mapChunkEmbeddingRow to throw");
}

export async function runChunkEmbeddingsMapperUnitSuite(): Promise<void> {
  await runParsesPgvectorWireStringIntoNumberArrayCase();
  await runRejectsMalformedEmbeddingStringCase();
  await runRejectsNonNumericArrayCase();
}

await runChunkEmbeddingsMapperUnitSuite();
