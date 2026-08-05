export type SupabaseAuthAdapterErrorCode =
  | "auth_start_email_magic_link_failed"
  | "auth_start_oauth_failed"
  | "auth_refresh_session_failed"
  | "auth_get_identity_failed"
  | "auth_sign_out_failed"
  | "auth_missing_session"
  | "auth_missing_user"
  | "auth_missing_expiry";

export class SupabaseAuthAdapterError extends Error {
  public readonly code: SupabaseAuthAdapterErrorCode;

  public constructor(code: SupabaseAuthAdapterErrorCode, message: string) {
    super(message);
    this.name = "SupabaseAuthAdapterError";
    this.code = code;
  }
}