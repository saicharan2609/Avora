import { randomUUID } from "node:crypto";

import type { JobId, ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

export const resourceIngestionJobName = "resources.ingestion.requested" as const;

export const resourceIngestionJobPriorities = [
  "normal",
  "high",
] as const;

export type ResourceIngestionJobPriority = (typeof resourceIngestionJobPriorities)[number];

export const resourceIngestionJobReasons = [
  "upload_completed",
] as const;

export type ResourceIngestionJobReason = (typeof resourceIngestionJobReasons)[number];

export const resourceIngestionJobStorageBuckets = [
  "quarantine",
  "originals",
  "derivatives",
  "exports",
  "shared",
] as const;

export type ResourceIngestionJobStorageBucket = (typeof resourceIngestionJobStorageBuckets)[number];

export type ResourceIngestionJobStorageLocation = Readonly<{
  bucket: ResourceIngestionJobStorageBucket;
  objectPath: string;
  version: number;
}>;

export type ResourceIngestionJobPayload = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  storage: ResourceIngestionJobStorageLocation;
  declaredMimeType: string;
  byteSize: number;
  contentHash: string;
  requestedAt: IsoDateTimeString;
}>;

export type ResourceIngestionJobEnvelope = Readonly<{
  jobId: JobId;
  name: typeof resourceIngestionJobName;
  reason: ResourceIngestionJobReason;
  priority: ResourceIngestionJobPriority;
  payload: ResourceIngestionJobPayload;
  enqueuedAt: IsoDateTimeString;
}>;

export type CreateResourceIngestionJobEnvelopeInput = Readonly<{
  reason: ResourceIngestionJobReason;
  priority: ResourceIngestionJobPriority;
  payload: ResourceIngestionJobPayload;
  enqueuedAt?: IsoDateTimeString;
}>;

export function createResourceIngestionJobEnvelope(
  input: CreateResourceIngestionJobEnvelopeInput,
): ResourceIngestionJobEnvelope {
  return {
    jobId: randomUUID() as JobId,
    name: resourceIngestionJobName,
    reason: input.reason,
    priority: input.priority,
    payload: input.payload,
    enqueuedAt: input.enqueuedAt ?? (new Date().toISOString() as IsoDateTimeString),
  };
}