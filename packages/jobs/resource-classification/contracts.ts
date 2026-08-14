import { randomUUID } from "node:crypto";

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

export type ResourceClassificationJobName =
  typeof resourceClassificationJobName;

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

export type ResourceClassificationJobEnvelope = Readonly<{
  jobId: JobId;
  name: ResourceClassificationJobName;
  reason: ResourceClassificationJobReason;
  priority: ResourceClassificationJobPriority;
  payload: ResourceClassificationJobPayload;
  enqueuedAt: IsoDateTimeString;
}>;

export type CreateResourceClassificationJobEnvelopeInput = Readonly<{
  reason: ResourceClassificationJobReason;
  priority: ResourceClassificationJobPriority;
  payload: ResourceClassificationJobPayload;
  enqueuedAt?: IsoDateTimeString;
}>;

export function createResourceClassificationJobId(): JobId {
  return randomUUID() as JobId;
}