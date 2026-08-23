import type {
  ResourceChunkingJobRequest,
} from "./contracts.js";

export type ResourceChunkingJobAccepted = Readonly<{
  jobId: string;
  acceptedAt: string;
}>;

export type EnqueueResourceChunkingInput = ResourceChunkingJobRequest;

export type ResourceChunkingQueuePort = Readonly<{
  enqueueResourceChunking: (
    input: EnqueueResourceChunkingInput,
  ) => Promise<ResourceChunkingJobAccepted>;
}>;
