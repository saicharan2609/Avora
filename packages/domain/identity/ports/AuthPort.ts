import type { AuthIdentity } from "../contracts/AuthIdentity.contract.js";
import type { AuthMethod } from "../contracts/AuthMethod.contract.js";
import type { AuthSession } from "../contracts/AuthSession.contract.js";
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
  startEmailMagicLink: (input: StartEmailMagicLinkInput) => Promise<void>;
  startOAuth: (input: StartOAuthInput) => Promise<void>;
  refreshSession: (input: RefreshSessionInput) => Promise<AuthSession>;
  getCurrentIdentity: () => Promise<AuthIdentity | null>;
  requireStepUp: (input: RequireStepUpInput) => Promise<void>;
  revokeSession: (input: RevokeSessionInput) => Promise<void>;
  signOut: () => Promise<void>;
}>;