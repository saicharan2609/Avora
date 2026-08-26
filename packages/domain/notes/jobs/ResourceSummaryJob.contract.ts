import type {
  JobId,
  ResourceId,
  StudentId,
} from "@avora/core/identity";
import type {
  IsoDateTimeString,
} from "@avora/core/time";

export const resourceSummaryJobName =
  "summary.generate.requested" as const;

export const resourceSummaryJobReasons = [
  "resource_indexed",
] as const;

export type ResourceSummaryJobReason =
  (typeof resourceSummaryJobReasons)[number];

export const resourceSummaryJobPriorities = [
  "interactive",
  "normal",
  "backfill",
] as const;

export type ResourceSummaryJobPriority =
  (typeof resourceSummaryJobPriorities)[number];

export type ResourceSummaryJobPayload = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  promptVersion: string;
  summaryStrategyVersion: string;
  requestedAt: IsoDateTimeString;
}>;

export type ResourceSummaryJobRequest = Readonly<{
  name: typeof resourceSummaryJobName;
  reason: ResourceSummaryJobReason;
  priority: ResourceSummaryJobPriority;
  payload: ResourceSummaryJobPayload;
}>;

export type ResourceSummaryJobAccepted = Readonly<{
  jobId: JobId;
  enqueuedAt: IsoDateTimeString;
}>;
