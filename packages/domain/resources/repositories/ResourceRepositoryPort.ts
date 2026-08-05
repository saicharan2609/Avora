import type { ResourceId, StudentId } from "@avora/core/identity";

import type { ResourceKind } from "../contracts/ResourceKind.contract.js";
import type { ResourceRecord } from "../contracts/ResourceRecord.contract.js";

export type CreatePendingResourceUploadInput = Readonly<{
  studentId: StudentId;
  kind: ResourceKind;
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

export type ResourceRepositoryPort = Readonly<{
  createPendingUpload: (input: CreatePendingResourceUploadInput) => Promise<ResourceRecord>;
  markUploadCompleted: (input: MarkResourceUploadCompletedInput) => Promise<ResourceRecord>;
  getById: (input: GetResourceByIdInput) => Promise<ResourceRecord | null>;
}>;