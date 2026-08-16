import type { ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

export const dbResourceKinds = [
  "document",
  "image",
  "scan",
  "audio",
  "video",
  "archive",
  "other",
] as const;

export type DbResourceKind = (typeof dbResourceKinds)[number];

export const dbResourceLifecycleStates = [
  "pending_upload",
  "uploaded",
  "rejected",
  "processing",
  "ready",
  "failed",
] as const;

export type DbResourceLifecycleState = (typeof dbResourceLifecycleStates)[number];

export const dbResourceStorageBuckets = [
  "quarantine",
  "originals",
  "derivatives",
  "exports",
  "shared",
] as const;

export type DbResourceStorageBucket = (typeof dbResourceStorageBuckets)[number];

export type DbResourceStorageLocation = Readonly<{
  bucket: DbResourceStorageBucket;
  objectPath: string;
  version: number;
}>;

export type DbResourceRecord = Readonly<{
  resourceId: ResourceId;
  studentId: StudentId;
  kind: DbResourceKind;
  originalFilename: string;
  declaredMimeType: string;
  byteSize: number;
  contentHash: string | null;
  lifecycleState: DbResourceLifecycleState;
  storage: DbResourceStorageLocation;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}>;

export type CreatePendingResourceUploadInput = Readonly<{
  studentId: StudentId;
  kind: DbResourceKind;
  originalFilename: string;
  declaredMimeType: string;
  byteSize: number;
}>;

export type MarkResourceUploadCompletedInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  contentHash: string;
}>;

export type GetResourceByIdInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
}>;

export type GetResourceForIngestionInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
}>;

export type MarkResourceProcessingInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
}>;

export type MarkResourceReadyInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
}>;

export type MarkResourceFailedInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  reason: string;
}>;

export type MarkResourceRejectedInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  reason: string;
}>;

export type ResourcesRepository = Readonly<{
  createPendingUpload: (input: CreatePendingResourceUploadInput) => Promise<DbResourceRecord>;
  markUploadCompleted: (input: MarkResourceUploadCompletedInput) => Promise<DbResourceRecord>;
  getResourceForIngestion: (input: GetResourceForIngestionInput) => Promise<DbResourceRecord | null>;
  markResourceProcessing: (input: MarkResourceProcessingInput) => Promise<DbResourceRecord>;
  markResourceReady: (input: MarkResourceReadyInput) => Promise<DbResourceRecord>;
  markResourceFailed: (input: MarkResourceFailedInput) => Promise<DbResourceRecord>;
  markResourceRejected: (input: MarkResourceRejectedInput) => Promise<DbResourceRecord>;
  getById: (input: GetResourceByIdInput) => Promise<DbResourceRecord | null>;
}>;