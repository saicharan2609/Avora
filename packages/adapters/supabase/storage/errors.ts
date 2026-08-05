export type SupabaseStorageAdapterErrorCode =
  | "storage_invalid_student_path"
  | "storage_invalid_object_path"
  | "storage_invalid_expiry"
  | "storage_signed_upload_url_failed"
  | "storage_signed_upload_url_missing"
  | "storage_signed_read_url_failed"
  | "storage_signed_read_url_missing"
  | "storage_promote_object_failed"
  | "storage_delete_object_failed";

export class SupabaseStorageAdapterError extends Error {
  public readonly code: SupabaseStorageAdapterErrorCode;

  public constructor(code: SupabaseStorageAdapterErrorCode, message: string) {
    super(message);
    this.name = "SupabaseStorageAdapterError";
    this.code = code;
  }
}