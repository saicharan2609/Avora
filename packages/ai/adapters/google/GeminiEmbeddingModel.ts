import type { EmbeddingStrategyVersion } from "../../embeddings/index.js";

export const geminiEmbeddingModelId = "gemini-embedding-001" as const;

// 1536 (not the model's native 3072) is a deliberate Stage 12 Group 2 decision:
// pgvector's HNSW/IVFFlat indexes only support up to 2000 dimensions for the
// standard `vector` type, and architecture.md requires an HNSW index on
// chunk_embeddings. gemini-embedding-001 supports truncated output
// dimensionality (Matryoshka representation learning), so 1536 stays within
// the standard `vector` type's indexable range without introducing a
// second, undocumented pgvector column type (halfvec). Owner-approved
// 2026-08-24; see packages/db/README.md and the Stage 12 Group 2 completion
// report.
export const geminiEmbeddingOutputDimensions = 1536 as const;

export const geminiEmbeddingStrategyVersion =
  "gemini-embedding-001.1536d.v1" as EmbeddingStrategyVersion;
