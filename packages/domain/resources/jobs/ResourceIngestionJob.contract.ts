import type { JobId, ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type { ResourceStorageLocation } from "../contracts/ResourceStorage.contract.js";

export const resourceIngestionJobName = "resources.ingestion.requested" as const;

export const resourceIngestionJobReasons = [
  "upload_completed",
] as const;

export type ResourceIngestionJobReason = (typeof resourceIngestionJobReasons)[number];

export const resourceIngestionJobPriorities = [
  "normal",
  "high",
] as const;

export type ResourceIngestionJobPriority = (typeof resourceIngestionJobPriorities)[number];

export type ResourceIngestionJobPayload = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  storage: ResourceStorageLocation;
  declaredMimeType: string;
  byteSize: number;
  contentHash: string;
  requestedAt: IsoDateTimeString;
}>;

export type ResourceIngestionJobRequest = Readonly<{
  name: typeof resourceIngestionJobName;
  reason: ResourceIngestionJobReason;
  priority: ResourceIngestionJobPriority;
  payload: ResourceIngestionJobPayload;
}>;

export type ResourceIngestionJobAccepted = Readonly<{
  jobId: JobId;
  enqueuedAt: IsoDateTimeString;
}>;