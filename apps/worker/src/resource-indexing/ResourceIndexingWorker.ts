import type {
  ClaimedDbResourceIndexingJobRecord,
  ResourceIndexingJobsRepository,
} from "@avora/db/repositories/resource-indexing-jobs";

export type ResourceIndexingJobHandlerResult =
  | Readonly<{
      outcome: "completed";
    }>
  | Readonly<{
      outcome: "failed";
      errorMessage: string;
    }>;

export type ResourceIndexingJobHandler = Readonly<{
  handle: (
    job: ClaimedDbResourceIndexingJobRecord,
  ) => Promise<ResourceIndexingJobHandlerResult>;
}>;

export type ResourceIndexingWorker = Readonly<{
  runOnce: () => Promise<"claimed" | "idle">;
}>;

export type ResourceIndexingClaimLoopOptions = Readonly<{
  limit: number;
  staleClaimThresholdSeconds: number;
}>;

export type CreateResourceIndexingWorkerInput = Readonly<{
  repository: ResourceIndexingJobsRepository;
  handler: ResourceIndexingJobHandler;
  options?: Partial<ResourceIndexingClaimLoopOptions>;
  workerId: string;
}>;

const defaultClaimOptions: ResourceIndexingClaimLoopOptions = {
  limit: 1,
  staleClaimThresholdSeconds: 120,
};

export function createResourceIndexingWorker(
  input: CreateResourceIndexingWorkerInput,
): ResourceIndexingWorker {
  const options = {
    ...defaultClaimOptions,
    ...input.options,
  };

  return {
    runOnce: async (): Promise<"claimed" | "idle"> => {
      const claimedJobs = await input.repository.claimQueuedResourceIndexingJobs({
        workerId: input.workerId,
        limit: options.limit,
        staleClaimThresholdSeconds: options.staleClaimThresholdSeconds,
      });

      const firstJob = claimedJobs[0];

      if (firstJob === undefined) {
        return "idle";
      }

      await input.repository.recordResourceIndexingJobHeartbeat({
        jobId: firstJob.jobId,
        workerId: input.workerId,
      });

      const result = await input.handler.handle(firstJob);

      if (result.outcome === "completed") {
        await input.repository.completeResourceIndexingJob({
          jobId: firstJob.jobId,
          workerId: input.workerId,
        });

        return "claimed";
      }

      await input.repository.failResourceIndexingJob({
        jobId: firstJob.jobId,
        workerId: input.workerId,
        errorMessage: result.errorMessage,
      });

      return "claimed";
    },
  };
}
