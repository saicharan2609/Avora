import type { EmbeddingStrategyVersion } from "../../embeddings/index.js";

export const geminiEmbeddingModelId = "gemini-embedding-001" as const;

export const geminiEmbeddingOutputDimensions = 3072 as const;

export const geminiEmbeddingStrategyVersion =
  "gemini-embedding-001.3072d.v1" as EmbeddingStrategyVersion;
