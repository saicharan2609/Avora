import type {
  ClaimedDbResourceExtractionJobRecord,
  ResourceExtractionJobsRepository,
} from "@avora/db/repositories/resource-extraction-jobs";

export type ResourceExtractionJobHandlerResult =
  | Readonly<{
      outcome: "completed";
    }>
  | Readonly<{
      outcome: "failed";
      errorMessage: string;
    }>;

export type ResourceExtractionJobHandler = Readonly<{
  handle: (
    job: ClaimedDbResourceExtractionJobRecord,
  ) => Promise<ResourceExtractionJobHandlerResult>;
}>;

export type ResourceExtractionWorker = Readonly<{
  runOnce: () => Promise<"claimed" | "idle">;
}>;

export type ResourceExtractionClaimLoopOptions = Readonly<{
  limit: number;
  staleClaimThresholdSeconds: number;
}>;

export type CreateResourceExtractionWorkerInput = Readonly<{
  repository: ResourceExtractionJobsRepository;
  handler: ResourceExtractionJobHandler;
  options?: Partial<ResourceExtractionClaimLoopOptions>;
  workerId: string;
}>;

const defaultClaimOptions: ResourceExtractionClaimLoopOptions = {
  limit: 1,
  staleClaimThresholdSeconds: 120,
};

export function createResourceExtractionWorker(
  input: CreateResourceExtractionWorkerInput,
): ResourceExtractionWorker {
  const options = {
    ...defaultClaimOptions,
    ...input.options,
  };

  return {
    runOnce: async (): Promise<"claimed" | "idle"> => {
      const claimedJobs = await input.repository.claimQueuedResourceExtractionJobs({
        workerId: input.workerId,
        limit: options.limit,
        staleClaimThresholdSeconds: options.staleClaimThresholdSeconds,
      });

      const firstJob = claimedJobs[0];

      if (firstJob === undefined) {
        return "idle";
      }

      await input.repository.recordResourceExtractionJobHeartbeat({
        jobId: firstJob.jobId,
        workerId: input.workerId,
      });

      const result = await input.handler.handle(firstJob);

      if (result.outcome === "completed") {
        await input.repository.completeResourceExtractionJob({
          jobId: firstJob.jobId,
          workerId: input.workerId,
        });

        return "claimed";
      }

      await input.repository.failResourceExtractionJob({
        jobId: firstJob.jobId,
        workerId: input.workerId,
        errorMessage: result.errorMessage,
      });

      return "claimed";
    },
  };
}
