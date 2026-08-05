import type { ResourceId, StudentId } from "@avora/core/identity";

import type { ResourceKind } from "./ResourceKind.contract.js";
import type { ResourceStorageLocation } from "./ResourceStorage.contract.js";

export type DeclareResourceUploadInput = Readonly<{
  studentId: StudentId;
  kind: ResourceKind;
  originalFilename: string;
  declaredMimeType: string;
  byteSize: number;
}>;

export type ResourceUploadTicket = Readonly<{
  resourceId: ResourceId;
  storage: ResourceStorageLocation;
  uploadUrl: string;
  expiresAt: string;
}>;

export type DeclareResourceUploadResult = Readonly<{
  ticket: ResourceUploadTicket;
}>;

export type CompleteResourceUploadInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  contentHash: string;
}>;