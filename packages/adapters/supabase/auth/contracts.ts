import type { StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

export type SupabaseAuthMethod = "google_oauth" | "apple_sign_in" | "email_magic_link";

export type SupabaseAuthRedirectTarget = Readonly<{
  redirectTo: string;
}>;

export type SupabaseAuthConnection = Readonly<{
  supabaseUrl: string;
  supabaseAnonKey: string;
}>;

export type SupabaseAuthStartResult = Readonly<{
  redirectUrl: string;
}>;

export type SupabaseAuthSession = Readonly<{
  studentId: StudentId;
  accessToken: string;
  refreshToken: string;
  expiresAt: IsoDateTimeString;
}>;

export type SupabaseAuthIdentity = Readonly<{
  studentId: StudentId;
}>;

export type SupabaseStartEmailMagicLinkInput = SupabaseAuthRedirectTarget &
  Readonly<{
    email: string;
  }>;

export type SupabaseStartOAuthInput = SupabaseAuthRedirectTarget &
  Readonly<{
    method: Extract<SupabaseAuthMethod, "google_oauth" | "apple_sign_in">;
  }>;

export type SupabaseExchangeCodeForSessionInput = Readonly<{
  code: string;
}>;

export type SupabaseRefreshSessionInput = Readonly<{
  refreshToken: string;
}>;

export type SupabaseAuthAdapter = Readonly<{
  startEmailMagicLink: (
    input: SupabaseStartEmailMagicLinkInput,
  ) => Promise<SupabaseAuthStartResult | null>;
  startOAuth: (input: SupabaseStartOAuthInput) => Promise<SupabaseAuthStartResult>;
  exchangeCodeForSession: (
    input: SupabaseExchangeCodeForSessionInput,
  ) => Promise<SupabaseAuthSession>;
  refreshSession: (input: SupabaseRefreshSessionInput) => Promise<SupabaseAuthSession>;
  getCurrentIdentity: () => Promise<SupabaseAuthIdentity | null>;
  signOut: () => Promise<void>;
}>;