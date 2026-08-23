import type {
  ClaimedDbResourceChunkingJobRecord,
  ResourceChunkingJobsRepository,
} from "@avora/db/repositories/resource-chunking-jobs";

export type ResourceChunkingJobHandlerResult =
  | Readonly<{
      outcome: "completed";
    }>
  | Readonly<{
      outcome: "failed";
      errorMessage: string;
    }>;

export type ResourceChunkingJobHandler = Readonly<{
  handle: (
    job: ClaimedDbResourceChunkingJobRecord,
  ) => Promise<ResourceChunkingJobHandlerResult>;
}>;

export type ResourceChunkingWorker = Readonly<{
  runOnce: () => Promise<"claimed" | "idle">;
}>;

export type ResourceChunkingClaimLoopOptions = Readonly<{
  limit: number;
  staleClaimThresholdSeconds: number;
}>;

export type CreateResourceChunkingWorkerInput = Readonly<{
  repository: ResourceChunkingJobsRepository;
  handler: ResourceChunkingJobHandler;
  options?: Partial<ResourceChunkingClaimLoopOptions>;
  workerId: string;
}>;

const defaultClaimOptions: ResourceChunkingClaimLoopOptions = {
  limit: 1,
  staleClaimThresholdSeconds: 120,
};

export function createResourceChunkingWorker(
  input: CreateResourceChunkingWorkerInput,
): ResourceChunkingWorker {
  const options = {
    ...defaultClaimOptions,
    ...input.options,
  };

  return {
    runOnce: async (): Promise<"claimed" | "idle"> => {
      const claimedJobs = await input.repository.claimQueuedResourceChunkingJobs({
        workerId: input.workerId,
        limit: options.limit,
        staleClaimThresholdSeconds: options.staleClaimThresholdSeconds,
      });

      const firstJob = claimedJobs[0];

      if (firstJob === undefined) {
        return "idle";
      }

      await input.repository.recordResourceChunkingJobHeartbeat({
        jobId: firstJob.jobId,
        workerId: input.workerId,
      });

      const result = await input.handler.handle(firstJob);

      if (result.outcome === "completed") {
        await input.repository.completeResourceChunkingJob({
          jobId: firstJob.jobId,
          workerId: input.workerId,
        });

        return "claimed";
      }

      await input.repository.failResourceChunkingJob({
        jobId: firstJob.jobId,
        workerId: input.workerId,
        errorMessage: result.errorMessage,
      });

      return "claimed";
    },
  };
}
