import type { ClaimedDbResourceSummaryJobRecord } from "@avora/db/repositories/resource-summary-jobs";

import type {
  ResourceSummaryWorkerHandler,
} from "./handler.js";
import type {
  ResourceSummaryJobHandler,
  ResourceSummaryJobHandlerResult,
} from "./ResourceSummaryWorker.js";
import type { ResourceSummaryWorkerInput } from "./contracts.js";

export type CreateResourceSummaryJobHandlerAdapterInput = Readonly<{
  summaryWorkerHandler: ResourceSummaryWorkerHandler;
}>;

export function createResourceSummaryJobHandlerAdapter(
  input: CreateResourceSummaryJobHandlerAdapterInput,
): ResourceSummaryJobHandler {
  return {
    handle: async (
      job: ClaimedDbResourceSummaryJobRecord,
    ): Promise<ResourceSummaryJobHandlerResult> => {
      const jobPayload: ResourceSummaryWorkerInput = {
        studentId: job.payload.studentId,
        resourceId: job.payload.resourceId,
        promptVersion: job.payload.promptVersion,
        summaryStrategyVersion: job.payload.summaryStrategyVersion,
        requestedAt: job.payload.requestedAt,
      };

      try {
        await input.summaryWorkerHandler.generateResourceSummary(jobPayload);

        return {
          outcome: "completed",
        };
      } catch (error) {
        return {
          outcome: "failed",
          errorMessage: error instanceof Error ? error.message : "Resource summary generation failed.",
        };
      }
    },
  };
}
