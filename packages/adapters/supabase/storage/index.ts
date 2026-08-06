export type {
  SupabaseCreateSignedReadUrlInput,
  SupabaseCreateSignedReadUrlResult,
  SupabaseCreateUploadTicketInput,
  SupabaseCreateUploadTicketResult,
  SupabaseDeleteObjectInput,
  SupabasePromoteObjectInput,
  SupabaseResourceStorageBucket,
  SupabaseResourceStorageLocation,
  SupabaseStorageAdapter,
  SupabaseStorageConnection,
} from "./contracts.js";
export type { SupabaseStorageAdapterErrorCode } from "./errors.js";

export { createSupabaseStorageAdapter } from "./adapter.js";
export { supabaseResourceStorageBuckets } from "./contracts.js";
export { SupabaseStorageAdapterError } from "./errors.js";
export {
  assertSafeObjectPath,
  assertStoragePathBelongsToStudent,
  createStudentResourceObjectPath,
} from "./path.js";
export type {
  CreateSupabaseStorageInspectionAdapterInput,
  SupabaseStorageInspectionAdapter,
  SupabaseStorageInspectionAdapterErrorCode,
} from "./inspection.js";

export {
  createSupabaseStorageInspectionAdapter,
  SupabaseStorageInspectionAdapterError,
} from "./inspection.js";