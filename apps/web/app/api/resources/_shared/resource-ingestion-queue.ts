import type {
  ResourceIngestionEnqueueInput,
  ResourceIngestionQueuePort,
} from "@avora/domain/resources";
import type { ResourceIngestionJobsRepository } from "@avora/db/repositories/jobs";

export type WebResourceIngestionQueue = ResourceIngestionQueuePort;

export type CreateWebResourceIngestionQueueInput = Readonly<{
  repository: ResourceIngestionJobsRepository;
}>;

export function createWebResourceIngestionQueue(
  input: CreateWebResourceIngestionQueueInput,
): WebResourceIngestionQueue {
  return {
    enqueueResourceIngestion: async (job: ResourceIngestionEnqueueInput) => {
      const record = await input.repository.enqueueResourceIngestionJob({
        studentId: job.payload.studentId,
        resourceId: job.payload.resourceId,
        jobName: job.name,
        reason: job.reason,
        priority: job.priority,
        payload: job.payload,
      });

      return {
        jobId: record.jobId,
        enqueuedAt: record.enqueuedAt,
      };
    },
  };
}