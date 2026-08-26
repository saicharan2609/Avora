import type {
  ClaimedDbResourceSummaryJobRecord,
  ResourceSummaryJobsRepository,
} from "@avora/db/repositories/resource-summary-jobs";

export type ResourceSummaryJobHandlerResult =
  | Readonly<{
      outcome: "completed";
    }>
  | Readonly<{
      outcome: "failed";
      errorMessage: string;
    }>;

export type ResourceSummaryJobHandler = Readonly<{
  handle: (
    job: ClaimedDbResourceSummaryJobRecord,
  ) => Promise<ResourceSummaryJobHandlerResult>;
}>;

export type ResourceSummaryWorker = Readonly<{
  runOnce: () => Promise<"claimed" | "idle">;
}>;

export type ResourceSummaryClaimLoopOptions = Readonly<{
  limit: number;
  staleClaimThresholdSeconds: number;
}>;

export type CreateResourceSummaryWorkerInput = Readonly<{
  repository: ResourceSummaryJobsRepository;
  handler: ResourceSummaryJobHandler;
  options?: Partial<ResourceSummaryClaimLoopOptions>;
  workerId: string;
}>;

const defaultClaimOptions: ResourceSummaryClaimLoopOptions = {
  limit: 1,
  staleClaimThresholdSeconds: 120,
};

export function createResourceSummaryWorker(
  input: CreateResourceSummaryWorkerInput,
): ResourceSummaryWorker {
  const options = {
    ...defaultClaimOptions,
    ...input.options,
  };

  return {
    runOnce: async (): Promise<"claimed" | "idle"> => {
      const claimedJobs = await input.repository.claimQueuedResourceSummaryJobs({
        workerId: input.workerId,
        limit: options.limit,
        staleClaimThresholdSeconds: options.staleClaimThresholdSeconds,
      });

      const firstJob = claimedJobs[0];

      if (firstJob === undefined) {
        return "idle";
      }

      await input.repository.recordResourceSummaryJobHeartbeat({
        jobId: firstJob.jobId,
        workerId: input.workerId,
      });

      const result = await input.handler.handle(firstJob);

      if (result.outcome === "completed") {
        await input.repository.completeResourceSummaryJob({
          jobId: firstJob.jobId,
          workerId: input.workerId,
        });

        return "claimed";
      }

      await input.repository.failResourceSummaryJob({
        jobId: firstJob.jobId,
        workerId: input.workerId,
        errorMessage: result.errorMessage,
      });

      return "claimed";
    },
  };
}
