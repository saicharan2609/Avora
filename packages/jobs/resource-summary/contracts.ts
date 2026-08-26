import { randomUUID } from "node:crypto";

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

export type ResourceSummaryJobName =
  typeof resourceSummaryJobName;

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

export type ResourceSummaryJobEnvelope = Readonly<{
  jobId: JobId;
  name: ResourceSummaryJobName;
  reason: ResourceSummaryJobReason;
  priority: ResourceSummaryJobPriority;
  payload: ResourceSummaryJobPayload;
  enqueuedAt: IsoDateTimeString;
}>;

export type CreateResourceSummaryJobEnvelopeInput = Readonly<{
  reason: ResourceSummaryJobReason;
  priority: ResourceSummaryJobPriority;
  payload: ResourceSummaryJobPayload;
  enqueuedAt?: IsoDateTimeString;
}>;

export function createResourceSummaryJobId(): JobId {
  return randomUUID() as JobId;
}
