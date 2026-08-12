import type {
  EmbeddedText,
  EmbeddingStrategyVersion,
} from "@avora/ai/embeddings";
import type {
  DbRetrievalChunkRecord,
} from "@avora/db/repositories/chunks";

import type {
  ResourceIndexingWorkerDependencies,
  ResourceIndexingWorkerInput,
  ResourceIndexingWorkerResult,
} from "./contracts.js";
import {
  ResourceIndexingWorkerError,
} from "./errors.js";
import {
  mapChunkToEmbeddingTextInput,
  mapEmbeddedTextToChunkEmbeddingRecord,
} from "./mapper.js";

export const resourceIndexingWorkerHandlerName =
  "resource-indexing-worker-handler";

export type ResourceIndexingWorkerHandler = Readonly<{
  indexResource: (
    input: ResourceIndexingWorkerInput,
  ) => Promise<ResourceIndexingWorkerResult>;
}>;

export function createResourceIndexingWorkerHandler(
  dependencies: ResourceIndexingWorkerDependencies,
): ResourceIndexingWorkerHandler {
  return {
    indexResource: async (
      input: ResourceIndexingWorkerInput,
    ): Promise<ResourceIndexingWorkerResult> => {
      const readyChunks =
        await dependencies.retrievalChunkRepository.listRetrievalChunksByResource({
          studentId: input.studentId,
          resourceId: input.resourceId,
          status: "ready",
        });

      if (readyChunks.length === 0) {
        return {
          studentId: input.studentId,
          resourceId: input.resourceId,
          embeddingStrategyVersion: input.embeddingStrategyVersion,
          chunkCount: 0,
          embeddedChunkCount: 0,
          skippedReason: "no_ready_chunks",
        };
      }

      const embeddingStrategyVersion =
        input.embeddingStrategyVersion as unknown as EmbeddingStrategyVersion;

      const embeddingInputs = readyChunks.map(mapChunkToEmbeddingTextInput);

      let embeddedTexts: readonly EmbeddedText[];

      try {
        const embeddingResult = await dependencies.embeddingPort.embedTexts({
          strategyVersion: embeddingStrategyVersion,
          inputs: embeddingInputs,
        });

        embeddedTexts = embeddingResult.embeddings;
      } catch (error) {
        throw new ResourceIndexingWorkerError(
          "resource_indexing_worker_embedding_failed",
          "Resource indexing worker failed to embed ready retrieval chunks.",
          { cause: error },
        );
      }

      const chunkEmbeddings = mapEmbeddedTextsToChunkEmbeddings(
        readyChunks,
        embeddedTexts,
        embeddingStrategyVersion,
      );

      try {
        await dependencies.embeddingIndexWriter.writeChunkEmbeddings({
          studentId: input.studentId,
          resourceId: input.resourceId,
          embeddingStrategyVersion,
          chunks: chunkEmbeddings,
        });
      } catch (error) {
        throw new ResourceIndexingWorkerError(
          "resource_indexing_worker_persistence_failed",
          "Resource indexing worker failed to persist chunk embeddings.",
          { cause: error },
        );
      }

      return {
        studentId: input.studentId,
        resourceId: input.resourceId,
        embeddingStrategyVersion: input.embeddingStrategyVersion,
        chunkCount: readyChunks.length,
        embeddedChunkCount: chunkEmbeddings.length,
        skippedReason: null,
      };
    },
  };
}

function mapEmbeddedTextsToChunkEmbeddings(
  chunks: readonly DbRetrievalChunkRecord[],
  embeddedTexts: readonly EmbeddedText[],
  embeddingStrategyVersion: EmbeddingStrategyVersion,
) {
  if (chunks.length !== embeddedTexts.length) {
    throw new ResourceIndexingWorkerError(
      "resource_indexing_worker_inconsistent_embedding_result",
      "Embedding result count does not match ready retrieval chunk count.",
    );
  }

  const embeddingsById = new Map<string, EmbeddedText>();

  for (const embeddedText of embeddedTexts) {
    embeddingsById.set(String(embeddedText.id), embeddedText);
  }

  return chunks.map((chunk) => {
    const embeddedText = embeddingsById.get(String(chunk.chunkId));

    if (embeddedText === undefined) {
      throw new ResourceIndexingWorkerError(
        "resource_indexing_worker_inconsistent_embedding_result",
        "Embedding result is missing a ready retrieval chunk id.",
      );
    }

    if (embeddedText.vector.length === 0) {
      throw new ResourceIndexingWorkerError(
        "resource_indexing_worker_inconsistent_embedding_result",
        "Embedding result contains an empty vector.",
      );
    }

    if (embeddedText.dimensions !== embeddedText.vector.length) {
      throw new ResourceIndexingWorkerError(
        "resource_indexing_worker_inconsistent_embedding_result",
        "Embedding result dimensions do not match vector length.",
      );
    }

    return mapEmbeddedTextToChunkEmbeddingRecord(
      chunk,
      embeddedText,
      embeddingStrategyVersion,
    );
  });
}