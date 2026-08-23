import type {
  ResourceUploadTicketEnqueueInput,
  ResourceUploadTicketQueuePort,
} from "@avora/domain/resources";
import type { ResourceUploadTicketJobsRepository } from "@avora/db/repositories/resource-upload-ticket-jobs";

export type WebResourceUploadTicketQueue = ResourceUploadTicketQueuePort;

export type CreateWebResourceUploadTicketQueueInput = Readonly<{
  repository: ResourceUploadTicketJobsRepository;
}>;

export function createWebResourceUploadTicketQueue(
  input: CreateWebResourceUploadTicketQueueInput,
): WebResourceUploadTicketQueue {
  return {
    enqueueResourceUploadTicket: async (job: ResourceUploadTicketEnqueueInput) => {
      const record = await input.repository.enqueueResourceUploadTicketJob({
        studentId: job.payload.studentId,
        resourceId: job.payload.resourceId,
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
