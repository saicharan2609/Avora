import type { ClaimedDbResourceChunkingJobRecord } from "@avora/db/repositories/resource-chunking-jobs";

import type {
  ResourceChunkingWorkerInput,
} from "./contracts.js";
import type {
  ResourceChunkingWorkerHandler,
} from "./handler.js";
import type {
  ResourceChunkingJobHandler,
  ResourceChunkingJobHandlerResult,
} from "./ResourceChunkingWorker.js";

export type CreateResourceChunkingJobHandlerAdapterInput = Readonly<{
  chunkingWorkerHandler: ResourceChunkingWorkerHandler;
}>;

export function createResourceChunkingJobHandlerAdapter(
  input: CreateResourceChunkingJobHandlerAdapterInput,
): ResourceChunkingJobHandler {
  return {
    handle: async (
      job: ClaimedDbResourceChunkingJobRecord,
    ): Promise<ResourceChunkingJobHandlerResult> => {
      try {
        await input.chunkingWorkerHandler.chunkExtractedResource({
          studentId: job.payload.studentId,
          resourceId: job.payload.resourceId,
          extractionDocumentId:
            job.payload.extractionDocumentId as unknown as ResourceChunkingWorkerInput["extractionDocumentId"],
          sourceContentHash: job.payload.sourceContentHash,
          chunkingStrategyVersion:
            job.payload.chunkingStrategyVersion as unknown as ResourceChunkingWorkerInput["chunkingStrategyVersion"],
          sanitisationStrategyVersion:
            job.payload.sanitisationStrategyVersion as unknown as ResourceChunkingWorkerInput["sanitisationStrategyVersion"],
          termId: job.payload.termId,
          subjectId: job.payload.subjectId,
          structureUnitId: job.payload.structureUnitId,
        });

        return {
          outcome: "completed",
        };
      } catch (error) {
        return {
          outcome: "failed",
          errorMessage: error instanceof Error ? error.message : "Resource chunking failed.",
        };
      }
    },
  };
}
