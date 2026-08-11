import type {
  ChunkingStrategy,
} from "@avora/retrieval/chunking";

import type {
  ResourceChunkingWorkerDependencies,
  ResourceChunkingWorkerInput,
  ResourceChunkingWorkerResult,
} from "./contracts.js";
import {
  ResourceChunkingWorkerError,
} from "./errors.js";
import {
  mapRetrievalChunkInputToDbCreateInput,
} from "./mapper.js";

export const resourceChunkingWorkerHandlerName =
  "resource-chunking-worker-handler";

export type ResourceChunkingWorkerHandler = Readonly<{
  chunkExtractedResource: (
    input: ResourceChunkingWorkerInput,
  ) => Promise<ResourceChunkingWorkerResult>;
}>;

const defaultTargetTokenEstimate = 750;
const defaultMaximumTokenEstimate = 900;
const defaultOverlapBlockCount = 0;

export function createResourceChunkingWorkerHandler(
  dependencies: ResourceChunkingWorkerDependencies,
): ResourceChunkingWorkerHandler {
  return {
    chunkExtractedResource: async (
      input: ResourceChunkingWorkerInput,
    ): Promise<ResourceChunkingWorkerResult> => {
      const extractionDocument =
        await dependencies.extractionRepository.getResourceExtractionDocumentById({
          studentId: input.studentId,
          resourceId: input.resourceId,
          extractionDocumentId: input.extractionDocumentId,
        });

      if (extractionDocument === null) {
        throw new ResourceChunkingWorkerError(
          "resource_chunking_worker_document_not_found",
          "Resource chunking worker could not find the extraction document.",
        );
      }

      if (!isChunkableExtractionStatus(extractionDocument.status)) {
        throw new ResourceChunkingWorkerError(
          "resource_chunking_worker_document_not_chunkable",
          "Resource chunking worker requires an extracted or partially extracted document.",
        );
      }

      const extractedContentBlocks =
        await dependencies.extractionRepository.listResourceExtractedContentBlocks({
          studentId: input.studentId,
          resourceId: input.resourceId,
          extractionDocumentId: input.extractionDocumentId,
        });

      if (extractedContentBlocks.length === 0) {
        throw new ResourceChunkingWorkerError(
          "resource_chunking_worker_no_blocks",
          "Resource chunking worker requires extracted content blocks.",
        );
      }

      const strategy = createChunkingStrategy(input);

      const chunkingResult = dependencies.resourceChunker.chunkResource({
        document: extractionDocument,
        blocks: extractedContentBlocks,
        sourceContentHash: input.sourceContentHash,
        scope: {
          termId: input.termId,
          subjectId: input.subjectId,
          structureUnitId: input.structureUnitId,
        },
        strategy,
      });

      const dbCreateInputs = chunkingResult.chunks.map(
        mapRetrievalChunkInputToDbCreateInput,
      );

      try {
        const persistedChunks =
          await dependencies.retrievalChunkRepository.createRetrievalChunks({
            chunks: dbCreateInputs,
          });

        return {
          studentId: input.studentId,
          resourceId: input.resourceId,
          extractionDocumentId: input.extractionDocumentId,
          chunkCount: persistedChunks.length,
          chunkIds: persistedChunks.map((chunk) => chunk.chunkId),
          chunkingStrategyVersion: input.chunkingStrategyVersion,
        };
      } catch (error) {
        throw new ResourceChunkingWorkerError(
          "resource_chunking_worker_persistence_failed",
          "Resource chunking worker failed to persist retrieval chunks.",
          { cause: error },
        );
      }
    },
  };
}

function createChunkingStrategy(
  input: ResourceChunkingWorkerInput,
): ChunkingStrategy {
  return {
    chunkingStrategyVersion: input.chunkingStrategyVersion,
    sanitisationStrategyVersion: input.sanitisationStrategyVersion,
    targetTokenEstimate: defaultTargetTokenEstimate,
    maximumTokenEstimate: defaultMaximumTokenEstimate,
    overlapBlockCount: defaultOverlapBlockCount,
  };
}

function isChunkableExtractionStatus(status: string): boolean {
  return status === "extracted" || status === "partially_extracted";
}