import { createHash } from "node:crypto";

import type {
  EmbeddedText,
  EmbeddingInputId,
  EmbeddingStrategyVersion,
  EmbeddingTextInput,
} from "@avora/ai/embeddings";
import type {
  DbRetrievalChunkRecord,
} from "@avora/db/repositories/chunks";

import type {
  ChunkEmbeddingRecord,
} from "./contracts.js";

export function mapChunkToEmbeddingTextInput(
  chunk: DbRetrievalChunkRecord,
): EmbeddingTextInput {
  return {
    id: String(chunk.chunkId) as EmbeddingInputId,
    text: chunk.text,
    contentHash: createStableTextHash(chunk.text),
    metadata: {
      studentId: String(chunk.studentId),
      resourceId: String(chunk.resourceId),
      chunkId: String(chunk.chunkId),
    },
  };
}

export function mapEmbeddedTextToChunkEmbeddingRecord(
  chunk: DbRetrievalChunkRecord,
  embeddedText: EmbeddedText,
  embeddingStrategyVersion: EmbeddingStrategyVersion,
): ChunkEmbeddingRecord {
  return {
    chunkId: chunk.chunkId,
    studentId: chunk.studentId,
    resourceId: chunk.resourceId,
    embeddingStrategyVersion,
    contentHash: embeddedText.contentHash,
    vector: embeddedText.vector,
    dimensions: embeddedText.dimensions,
  };
}

function createStableTextHash(text: string): string {
  return createHash("sha256")
    .update(text)
    .digest("hex");
}