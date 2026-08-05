import type { ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

export const supabaseResourceStorageBuckets = [
  "quarantine",
  "originals",
  "derivatives",
  "exports",
  "shared",
] as const;

export type SupabaseResourceStorageBucket = (typeof supabaseResourceStorageBuckets)[number];

export type SupabaseStorageConnection = Readonly<{
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
}>;

export type SupabaseResourceStorageLocation = Readonly<{
  bucket: SupabaseResourceStorageBucket;
  objectPath: string;
  version: number;
}>;

export type SupabaseCreateUploadTicketInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  bucket: Extract<SupabaseResourceStorageBucket, "quarantine">;
  objectPath: string;
  byteSize: number;
  declaredMimeType: string;
}>;

export type SupabaseCreateUploadTicketResult = Readonly<{
  storage: SupabaseResourceStorageLocation;
  uploadUrl: string;
  expiresAt: IsoDateTimeString;
}>;

export type SupabaseCreateSignedReadUrlInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  storage: SupabaseResourceStorageLocation;
  expiresInSeconds: number;
}>;

export type SupabaseCreateSignedReadUrlResult = Readonly<{
  readUrl: string;
  expiresAt: IsoDateTimeString;
}>;

export type SupabasePromoteObjectInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  from: SupabaseResourceStorageLocation;
  to: SupabaseResourceStorageLocation;
}>;

export type SupabaseDeleteObjectInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  storage: SupabaseResourceStorageLocation;
}>;

export type SupabaseStorageAdapter = Readonly<{
  createUploadTicket: (
    input: SupabaseCreateUploadTicketInput,
  ) => Promise<SupabaseCreateUploadTicketResult>;
  createSignedReadUrl: (
    input: SupabaseCreateSignedReadUrlInput,
  ) => Promise<SupabaseCreateSignedReadUrlResult>;
  promoteObject: (input: SupabasePromoteObjectInput) => Promise<void>;
  deleteObject: (input: SupabaseDeleteObjectInput) => Promise<void>;
}>;