import type { ClaimedDbResourceClassificationJobRecord } from "@avora/db/repositories/resource-classification-jobs";

import type {
  ResourceClassificationWorkerHandler,
} from "./handler.js";
import type {
  ResourceClassificationJobHandler,
  ResourceClassificationJobHandlerResult,
} from "./ResourceClassificationWorker.js";
import type { ResourceClassificationWorkerInput } from "./contracts.js";

export type CreateResourceClassificationJobHandlerAdapterInput = Readonly<{
  classificationWorkerHandler: ResourceClassificationWorkerHandler;
}>;

export function createResourceClassificationJobHandlerAdapter(
  input: CreateResourceClassificationJobHandlerAdapterInput,
): ResourceClassificationJobHandler {
  return {
    handle: async (
      job: ClaimedDbResourceClassificationJobRecord,
    ): Promise<ResourceClassificationJobHandlerResult> => {
      const jobPayload: ResourceClassificationWorkerInput = {
        studentId: job.payload.studentId,
        resourceId: job.payload.resourceId,
        classificationStrategyVersion: job.payload.classificationStrategyVersion,
        placementPolicyVersion: job.payload.placementPolicyVersion,
        requestedAt: job.payload.requestedAt,
      };

      try {
        await input.classificationWorkerHandler.classifyResource(jobPayload);

        return {
          outcome: "completed",
        };
      } catch (error) {
        return {
          outcome: "failed",
          errorMessage: error instanceof Error ? error.message : "Resource classification failed.",
        };
      }
    },
  };
}
