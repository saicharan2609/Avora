import type { ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type { ResourceKind } from "./ResourceKind.contract.js";
import type { ResourceRecord } from "./ResourceRecord.contract.js";
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
  expiresAt: IsoDateTimeString;
}>;

export type DeclareResourceUploadResult = Readonly<{
  resource: ResourceRecord;
  ticket: ResourceUploadTicket;
}>;

export type CompleteResourceUploadInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  contentHash: string;
}>;

export type CompleteResourceUploadResult = Readonly<{
  resource: ResourceRecord;
}>;