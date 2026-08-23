import type { ClaimedDbResourceExtractionJobRecord } from "@avora/db/repositories/resource-extraction-jobs";
import {
  resourceExtractionJobName,
} from "@avora/jobs/resource-extraction";

import type {
  ResourceExtractionWorkerHandler,
} from "./handler.js";
import type {
  ResourceExtractionJobHandler,
  ResourceExtractionJobHandlerResult,
} from "./ResourceExtractionWorker.js";

export type CreateResourceExtractionJobHandlerAdapterInput = Readonly<{
  extractionWorkerHandler: ResourceExtractionWorkerHandler;
}>;

export function createResourceExtractionJobHandlerAdapter(
  input: CreateResourceExtractionJobHandlerAdapterInput,
): ResourceExtractionJobHandler {
  return {
    handle: async (
      job: ClaimedDbResourceExtractionJobRecord,
    ): Promise<ResourceExtractionJobHandlerResult> => {
      const result = await input.extractionWorkerHandler.handleResourceExtractionJob({
        job: {
          name: resourceExtractionJobName,
          reason: job.reason,
          priority: job.priority,
          payload: job.payload,
        },
      });

      if (result.outcome === "failed") {
        return {
          outcome: "failed",
          errorMessage: result.failure?.message ?? "Resource extraction failed.",
        };
      }

      return {
        outcome: "completed",
      };
    },
  };
}
