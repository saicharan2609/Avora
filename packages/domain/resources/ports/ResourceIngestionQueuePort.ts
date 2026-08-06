import type {
  ResourceIngestionJobAccepted,
  ResourceIngestionJobRequest,
} from "../jobs/index.js";

export type ResourceIngestionEnqueueInput = ResourceIngestionJobRequest;

export type ResourceIngestionEnqueueResult = ResourceIngestionJobAccepted;

export type ResourceIngestionQueuePort = Readonly<{
  enqueueResourceIngestion: (
    input: ResourceIngestionEnqueueInput,
  ) => Promise<ResourceIngestionEnqueueResult>;
}>;