import type {
  ResourceClassificationJobEnvelope,
} from "./contracts.js";

export type ResourceClassificationJobAccepted = Readonly<{
  jobId: string;
  acceptedAt: string;
}>;

export type EnqueueResourceClassificationInput =
  ResourceClassificationJobEnvelope;

export type ResourceClassificationQueuePort = Readonly<{
  enqueueResourceClassification: (
    input: EnqueueResourceClassificationInput,
  ) => Promise<ResourceClassificationJobAccepted>;
}>;