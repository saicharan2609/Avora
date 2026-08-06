import type {
  ResourceIngestionEnqueueInput,
  ResourceIngestionQueuePort,
} from "@avora/domain/resources";
import { createResourceIngestionJobEnvelope } from "@avora/jobs/queue";

export type WebResourceIngestionQueue = ResourceIngestionQueuePort;

export function createWebResourceIngestionQueue(): WebResourceIngestionQueue {
  return {
    enqueueResourceIngestion: async (input: ResourceIngestionEnqueueInput) => {
      const envelope = createResourceIngestionJobEnvelope({
        reason: input.reason,
        priority: input.priority,
        payload: input.payload,
      });

      return {
        jobId: envelope.jobId,
        enqueuedAt: envelope.enqueuedAt,
      };
    },
  };
}