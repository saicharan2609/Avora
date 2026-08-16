import type { ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

export const resourceExtractionJobName = "resource.extraction.extract" as const;

export type ResourceExtractionJobName = typeof resourceExtractionJobName;

export const resourceExtractionJobReasons = [
  "resource_validation_succeeded",
  "manual_reprocess_requested",
] as const;

export type ResourceExtractionJobReason =
  (typeof resourceExtractionJobReasons)[number];

export const resourceExtractionJobPriorities = [
  "interactive",
  "normal",
  "backfill",
] as const;

export type ResourceExtractionJobPriority =
  (typeof resourceExtractionJobPriorities)[number];

export const resourceExtractionStorageBuckets = [
  "resources",
] as const;

export type ResourceExtractionStorageBucket =
  (typeof resourceExtractionStorageBuckets)[number];

export type ResourceExtractionStorageObject = Readonly<{
  bucket: ResourceExtractionStorageBucket;
  objectPath: string;
}>;

export type ResourceExtractionJobPayload = Readonly<{
  extractionDocumentId: string;
  studentId: StudentId;
  resourceId: ResourceId;
  storage: ResourceExtractionStorageObject;
  declaredMimeType: string;
  byteSize: number;
  contentHash: string;
  extractionStrategyVersion: string;
  chunkingStrategyVersion: string;
  requestedAt: IsoDateTimeString;
}>;

export type ResourceExtractionJobRequest = Readonly<{
  name: ResourceExtractionJobName;
  reason: ResourceExtractionJobReason;
  priority: ResourceExtractionJobPriority;
  payload: ResourceExtractionJobPayload;
}>;

export type CreateResourceExtractionJobEnvelopeInput = Readonly<{
  reason: ResourceExtractionJobReason;
  priority: ResourceExtractionJobPriority;
  payload: ResourceExtractionJobPayload;
}>;