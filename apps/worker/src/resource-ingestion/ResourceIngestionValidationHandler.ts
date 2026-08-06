import type { ClaimedResourceIngestionJob } from "@avora/jobs/claim";
import type { ResourceIngestionValidationService } from "@avora/domain/resources";

import type { ResourceIngestionJobHandler, ResourceIngestionJobHandlerResult } from "./ResourceIngestionWorker.js";

export type CreateResourceIngestionValidationHandlerInput = Readonly<{
  validationService: ResourceIngestionValidationService;
}>;

export function createResourceIngestionValidationHandler(
  input: CreateResourceIngestionValidationHandlerInput,
): ResourceIngestionJobHandler {
  return {
    handle: async (
      job: ClaimedResourceIngestionJob,
    ): Promise<ResourceIngestionJobHandlerResult> => {
      const result = await input.validationService.validateResourceIngestion({
        payload: job.payload,
      });

      if (result.outcome === "valid") {
        return {
          outcome: "completed",
        };
      }

      return {
        outcome: "failed",
        errorMessage: result.issue.message,
      };
    },
  };
}