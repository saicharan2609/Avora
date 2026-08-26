import type {
  ResourceSummaryJobEnvelope,
} from "./contracts.js";

export type ResourceSummaryJobAccepted = Readonly<{
  jobId: string;
  acceptedAt: string;
}>;

export type EnqueueResourceSummaryInput =
  ResourceSummaryJobEnvelope;

export type ResourceSummaryQueuePort = Readonly<{
  enqueueResourceSummary: (
    input: EnqueueResourceSummaryInput,
  ) => Promise<ResourceSummaryJobAccepted>;
}>;
