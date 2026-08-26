import { ResourceSummaryWorkerError } from "./errors.js";
import { mapGeneratedSummaryToSaveInput } from "./mapper.js";
import type {
  ResourceSummaryWorkerDependencies,
  ResourceSummaryWorkerInput,
  ResourceSummaryWorkerResult,
} from "./contracts.js";

export const resourceSummaryWorkerHandlerName =
  "resource-summary-worker-handler";

export type ResourceSummaryWorkerHandler = Readonly<{
  generateResourceSummary: (
    input: ResourceSummaryWorkerInput,
  ) => Promise<ResourceSummaryWorkerResult>;
}>;

export function createResourceSummaryWorkerHandler(
  dependencies: ResourceSummaryWorkerDependencies,
): ResourceSummaryWorkerHandler {
  return {
    generateResourceSummary: async (
      input: ResourceSummaryWorkerInput,
    ): Promise<ResourceSummaryWorkerResult> => {
      const response = await dependencies.summaryGateway.generateResourceSummary({
        studentId: input.studentId,
        resourceId: input.resourceId,
        promptVersion: input.promptVersion,
        summaryStrategyVersion: input.summaryStrategyVersion,
        requestedAt: input.requestedAt,
      });

      if (response.status === "insufficient_evidence") {
        // EP-06 / ENG-252: an honest, non-retry terminal outcome — the
        // resource has too little indexed content to summarise yet. This
        // is not a job failure; retrying would not change the outcome
        // without a new indexing event re-triggering the pipeline.
        return {
          studentId: input.studentId,
          resourceId: input.resourceId,
          outcome: "insufficient_evidence",
        };
      }

      if (response.status === "refused") {
        // A provider invocation or citation-validation failure. Surfaced
        // as a thrown error so the job handler adapter records it as a
        // failed attempt, entering the bounded-retry / dead-letter path
        // (ENG-193) rather than silently discarding the summary attempt.
        throw new ResourceSummaryWorkerError(
          "resource_summary_worker_generation_refused",
          response.message,
        );
      }

      try {
        await dependencies.resourceSummariesRepository.saveResourceSummary(
          mapGeneratedSummaryToSaveInput(response),
        );
      } catch (error) {
        throw new ResourceSummaryWorkerError(
          "resource_summary_worker_persistence_failed",
          "Resource summary worker failed to persist the generated summary.",
          { cause: error },
        );
      }

      return {
        studentId: input.studentId,
        resourceId: input.resourceId,
        outcome: "generated",
      };
    },
  };
}
