import type { ClaimedDbResourceIndexingJobRecord } from "@avora/db/repositories/resource-indexing-jobs";
import type {
  IndexResourceJobPayload,
} from "@avora/retrieval/indexing";

import type {
  ResourceIndexingWorkerHandler,
} from "./handler.js";
import type {
  ResourceIndexingJobHandler,
  ResourceIndexingJobHandlerResult,
} from "./ResourceIndexingWorker.js";

export type CreateResourceIndexingJobHandlerAdapterInput = Readonly<{
  indexingWorkerHandler: ResourceIndexingWorkerHandler;
}>;

export function createResourceIndexingJobHandlerAdapter(
  input: CreateResourceIndexingJobHandlerAdapterInput,
): ResourceIndexingJobHandler {
  return {
    handle: async (
      job: ClaimedDbResourceIndexingJobRecord,
    ): Promise<ResourceIndexingJobHandlerResult> => {
      const jobPayload: IndexResourceJobPayload = {
        studentId: job.payload.studentId,
        resourceId: job.payload.resourceId,
        embeddingStrategyVersion:
          job.payload.embeddingStrategyVersion as unknown as IndexResourceJobPayload["embeddingStrategyVersion"],
        requestedAt: job.payload.requestedAt,
        reason: job.reason,
        priority: job.priority,
        chunkingStrategyVersion: job.payload.chunkingStrategyVersion,
        sourceContentHash: job.payload.sourceContentHash,
      };

      try {
        await input.indexingWorkerHandler.indexResource(jobPayload);

        return {
          outcome: "completed",
        };
      } catch (error) {
        return {
          outcome: "failed",
          errorMessage: error instanceof Error ? error.message : "Resource indexing failed.",
        };
      }
    },
  };
}
