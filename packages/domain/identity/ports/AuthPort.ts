import type { AuthIdentity } from "../contracts/AuthIdentity.contract.js";
import type { AuthMethod } from "../contracts/AuthMethod.contract.js";
import type { AuthSession } from "../contracts/AuthSession.contract.js";
import type { AuthStartResult } from "../contracts/AuthStartResult.contract.js";
import type { StepUpReason } from "../contracts/StepUpReason.contract.js";

export type AuthRedirectTarget = Readonly<{
  redirectTo: string;
}>;

export type StartEmailMagicLinkInput = AuthRedirectTarget &
  Readonly<{
    email: string;
  }>;

export type StartOAuthInput = AuthRedirectTarget &
  Readonly<{
    method: Extract<AuthMethod, "google_oauth" | "apple_sign_in">;
  }>;

export type ExchangeCodeForSessionInput = Readonly<{
  code: string;
}>;

export type RefreshSessionInput = Readonly<{
  refreshToken: string;
}>;

export type RevokeSessionInput = Readonly<{
  sessionId: string;
}>;

export type RequireStepUpInput = Readonly<{
  reason: StepUpReason;
}>;

export type AuthPort = Readonly<{
  startEmailMagicLink: (input: StartEmailMagicLinkInput) => Promise<AuthStartResult | null>;
  startOAuth: (input: StartOAuthInput) => Promise<AuthStartResult>;
  exchangeCodeForSession: (input: ExchangeCodeForSessionInput) => Promise<AuthSession>;
  refreshSession: (input: RefreshSessionInput) => Promise<AuthSession>;
  getCurrentIdentity: () => Promise<AuthIdentity | null>;
  requireStepUp: (input: RequireStepUpInput) => Promise<void>;
  revokeSession: (input: RevokeSessionInput) => Promise<void>;
  signOut: () => Promise<void>;
}>;