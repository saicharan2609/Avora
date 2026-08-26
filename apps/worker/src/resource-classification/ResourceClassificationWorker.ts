import type {
  ClaimedDbResourceClassificationJobRecord,
  ResourceClassificationJobsRepository,
} from "@avora/db/repositories/resource-classification-jobs";

export type ResourceClassificationJobHandlerResult =
  | Readonly<{
      outcome: "completed";
    }>
  | Readonly<{
      outcome: "failed";
      errorMessage: string;
    }>;

export type ResourceClassificationJobHandler = Readonly<{
  handle: (
    job: ClaimedDbResourceClassificationJobRecord,
  ) => Promise<ResourceClassificationJobHandlerResult>;
}>;

export type ResourceClassificationWorker = Readonly<{
  runOnce: () => Promise<"claimed" | "idle">;
}>;

export type ResourceClassificationClaimLoopOptions = Readonly<{
  limit: number;
  staleClaimThresholdSeconds: number;
}>;

export type CreateResourceClassificationWorkerInput = Readonly<{
  repository: ResourceClassificationJobsRepository;
  handler: ResourceClassificationJobHandler;
  options?: Partial<ResourceClassificationClaimLoopOptions>;
  workerId: string;
}>;

const defaultClaimOptions: ResourceClassificationClaimLoopOptions = {
  limit: 1,
  staleClaimThresholdSeconds: 120,
};

export function createResourceClassificationWorker(
  input: CreateResourceClassificationWorkerInput,
): ResourceClassificationWorker {
  const options = {
    ...defaultClaimOptions,
    ...input.options,
  };

  return {
    runOnce: async (): Promise<"claimed" | "idle"> => {
      const claimedJobs = await input.repository.claimQueuedResourceClassificationJobs({
        workerId: input.workerId,
        limit: options.limit,
        staleClaimThresholdSeconds: options.staleClaimThresholdSeconds,
      });

      const firstJob = claimedJobs[0];

      if (firstJob === undefined) {
        return "idle";
      }

      await input.repository.recordResourceClassificationJobHeartbeat({
        jobId: firstJob.jobId,
        workerId: input.workerId,
      });

      const result = await input.handler.handle(firstJob);

      if (result.outcome === "completed") {
        await input.repository.completeResourceClassificationJob({
          jobId: firstJob.jobId,
          workerId: input.workerId,
        });

        return "claimed";
      }

      await input.repository.failResourceClassificationJob({
        jobId: firstJob.jobId,
        workerId: input.workerId,
        errorMessage: result.errorMessage,
      });

      return "claimed";
    },
  };
}
