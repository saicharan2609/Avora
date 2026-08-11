import type {
  ResourceExtractionJobRequest,
} from "./contracts.js";

export type ResourceExtractionJobAccepted = Readonly<{
  jobId: string;
  acceptedAt: string;
}>;

export type EnqueueResourceExtractionInput = ResourceExtractionJobRequest;

export type ResourceExtractionQueuePort = Readonly<{
  enqueueResourceExtraction: (
    input: EnqueueResourceExtractionInput,
  ) => Promise<ResourceExtractionJobAccepted>;
}>;