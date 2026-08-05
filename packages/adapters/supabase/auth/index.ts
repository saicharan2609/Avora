export type {
  SupabaseAuthAdapter,
  SupabaseAuthConnection,
  SupabaseAuthIdentity,
  SupabaseAuthMethod,
  SupabaseAuthRedirectTarget,
  SupabaseAuthSession,
  SupabaseAuthStartResult,
  SupabaseExchangeCodeForSessionInput,
  SupabaseRefreshSessionInput,
  SupabaseStartEmailMagicLinkInput,
  SupabaseStartOAuthInput,
} from "./contracts.js";
export type { SupabaseAuthAdapterErrorCode } from "./errors.js";

export { createSupabaseAuthAdapter } from "./adapter.js";
export { SupabaseAuthAdapterError } from "./errors.js";