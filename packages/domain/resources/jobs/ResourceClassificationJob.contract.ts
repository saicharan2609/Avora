import type {
  JobId,
  ResourceId,
  StudentId,
} from "@avora/core/identity";
import type {
  IsoDateTimeString,
} from "@avora/core/time";

export const resourceClassificationJobName =
  "resource.classification.requested" as const;

export const resourceClassificationJobReasons = [
  "resource_ingestion_validated",
  "placement_reclassification_requested",
] as const;

export type ResourceClassificationJobReason =
  (typeof resourceClassificationJobReasons)[number];

export const resourceClassificationJobPriorities = [
  "interactive",
  "normal",
  "backfill",
] as const;

export type ResourceClassificationJobPriority =
  (typeof resourceClassificationJobPriorities)[number];

export type ResourceClassificationJobPayload = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  classificationStrategyVersion: string;
  placementPolicyVersion: string;
  requestedAt: IsoDateTimeString;
}>;

export type ResourceClassificationJobRequest = Readonly<{
  name: typeof resourceClassificationJobName;
  reason: ResourceClassificationJobReason;
  priority: ResourceClassificationJobPriority;
  payload: ResourceClassificationJobPayload;
}>;

export type ResourceClassificationJobAccepted = Readonly<{
  jobId: JobId;
  enqueuedAt: IsoDateTimeString;
}>;