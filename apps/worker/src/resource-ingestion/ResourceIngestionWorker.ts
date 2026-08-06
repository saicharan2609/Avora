import type {
  ClaimedResourceIngestionJob,
  ResourceIngestionClaimLoopOptions,
} from "@avora/jobs/claim";
import type { ResourceIngestionJobsRepository } from "@avora/db/repositories/jobs";

export type ResourceIngestionJobHandlerResult =
  | Readonly<{
      outcome: "completed";
    }>
  | Readonly<{
      outcome: "failed";
      errorMessage: string;
    }>;

export type ResourceIngestionJobHandler = Readonly<{
  handle: (job: ClaimedResourceIngestionJob) => Promise<ResourceIngestionJobHandlerResult>;
}>;

export type ResourceIngestionWorker = Readonly<{
  runOnce: () => Promise<"claimed" | "idle">;
}>;

export type CreateResourceIngestionWorkerInput = Readonly<{
  repository: ResourceIngestionJobsRepository;
  handler: ResourceIngestionJobHandler;
  options?: Partial<ResourceIngestionClaimLoopOptions>;
  workerId: string;
}>;

const defaultClaimOptions: ResourceIngestionClaimLoopOptions = {
  limit: 1,
  staleClaimThresholdSeconds: 120,
};

export function createResourceIngestionWorker(
  input: CreateResourceIngestionWorkerInput,
): ResourceIngestionWorker {
  const options = {
    ...defaultClaimOptions,
    ...input.options,
  };

  return {
    runOnce: async (): Promise<"claimed" | "idle"> => {
      const claimedJobs = await input.repository.claimQueuedResourceIngestionJobs({
        workerId: input.workerId,
        limit: options.limit,
        staleClaimThresholdSeconds: options.staleClaimThresholdSeconds,
      });

      const firstJob = claimedJobs[0];

      if (firstJob === undefined) {
        return "idle";
      }

      await input.repository.recordResourceIngestionJobHeartbeat({
        jobId: firstJob.jobId,
        workerId: input.workerId,
      });

      const result = await input.handler.handle(firstJob);

      if (result.outcome === "completed") {
        await input.repository.completeResourceIngestionJob({
          jobId: firstJob.jobId,
          workerId: input.workerId,
        });

        return "claimed";
      }

      await input.repository.failResourceIngestionJob({
        jobId: firstJob.jobId,
        workerId: input.workerId,
        errorMessage: result.errorMessage,
      });

      return "claimed";
    },
  };
}