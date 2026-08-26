import type {
  ResourceSummaryJobAccepted,
  ResourceSummaryJobRequest,
} from "../jobs/index.js";

export type ResourceSummaryEnqueueInput = ResourceSummaryJobRequest;

export type ResourceSummaryEnqueueResult = ResourceSummaryJobAccepted;

export type ResourceSummaryQueuePort = Readonly<{
  enqueueResourceSummary: (
    input: ResourceSummaryEnqueueInput,
  ) => Promise<ResourceSummaryEnqueueResult>;
}>;
