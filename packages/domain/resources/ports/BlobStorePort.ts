import type { ResourceId, StudentId } from "@avora/core/identity";

import type {
  ResourceStorageBucket,
  ResourceStorageLocation,
} from "../contracts/ResourceStorage.contract.js";

export type CreateUploadTicketInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  bucket: Extract<ResourceStorageBucket, "quarantine">;
  objectPath: string;
  byteSize: number;
  declaredMimeType: string;
}>;

export type CreateUploadTicketResult = Readonly<{
  storage: ResourceStorageLocation;
  uploadUrl: string;
  expiresAt: string;
}>;

export type CreateSignedReadUrlInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  storage: ResourceStorageLocation;
  expiresInSeconds: number;
}>;

export type CreateSignedReadUrlResult = Readonly<{
  readUrl: string;
  expiresAt: string;
}>;

export type PromoteObjectInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  from: ResourceStorageLocation;
  to: ResourceStorageLocation;
}>;

export type DeleteObjectInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  storage: ResourceStorageLocation;
}>;

export type BlobStorePort = Readonly<{
  createUploadTicket: (input: CreateUploadTicketInput) => Promise<CreateUploadTicketResult>;
  createSignedReadUrl: (input: CreateSignedReadUrlInput) => Promise<CreateSignedReadUrlResult>;
  promoteObject: (input: PromoteObjectInput) => Promise<void>;
  deleteObject: (input: DeleteObjectInput) => Promise<void>;
}>;