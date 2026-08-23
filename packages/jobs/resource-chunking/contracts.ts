import type { ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

export const resourceChunkingJobName = "resource.chunking.chunk" as const;

export type ResourceChunkingJobName = typeof resourceChunkingJobName;

export const resourceChunkingJobReasons = [
  "resource_extraction_succeeded",
  "manual_rechunk_requested",
] as const;

export type ResourceChunkingJobReason =
  (typeof resourceChunkingJobReasons)[number];

export const resourceChunkingJobPriorities = [
  "interactive",
  "normal",
  "backfill",
] as const;

export type ResourceChunkingJobPriority =
  (typeof resourceChunkingJobPriorities)[number];

export type ResourceChunkingJobPayload = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  extractionDocumentId: string;
  sourceContentHash: string;
  chunkingStrategyVersion: string;
  sanitisationStrategyVersion: string;
  termId: string | null;
  subjectId: string | null;
  structureUnitId: string | null;
  requestedAt: IsoDateTimeString;
}>;

export type ResourceChunkingJobRequest = Readonly<{
  name: ResourceChunkingJobName;
  reason: ResourceChunkingJobReason;
  priority: ResourceChunkingJobPriority;
  payload: ResourceChunkingJobPayload;
}>;

export type CreateResourceChunkingJobEnvelopeInput = Readonly<{
  reason: ResourceChunkingJobReason;
  priority: ResourceChunkingJobPriority;
  payload: ResourceChunkingJobPayload;
}>;
