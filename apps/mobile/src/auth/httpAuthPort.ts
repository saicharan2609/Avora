import type {
  AuthIdentity,
  AuthPort,
  AuthSession,
  AuthStartResult,
  ExchangeCodeForSessionInput,
  RefreshSessionInput,
  RequireStepUpInput,
  RevokeSessionInput,
  StartEmailMagicLinkInput,
  StartOAuthInput,
  VerifyEmailOtpInput,
} from "@avora/domain/identity";

export class MobileAuthPortNotYetAvailableError extends Error {
  public constructor(operation: string) {
    super(`${operation} has no Avora API route yet and is not available on mobile.`);
    this.name = "MobileAuthPortNotYetAvailableError";
  }
}

export class MobileAuthPortExchangeFailedError extends Error {
  public constructor() {
    super("The sign-in link has expired or was already used. Please sign in again.");
    this.name = "MobileAuthPortExchangeFailedError";
  }
}

export class MobileAuthPortVerifyOtpFailedError extends Error {
  public constructor() {
    super("That code is invalid or has expired. Please try again.");
    this.name = "MobileAuthPortVerifyOtpFailedError";
  }
}

export type CreateHttpAuthPortInput = Readonly<{
  apiBaseUrl: string;
}>;

/**
 * Mobile never holds a Supabase SDK or the Supabase URL/key (REPOSITORY.md
 * dependency matrix forbids apps/mobile -> @avora/adapters). Every operation
 * here calls Avora's own web API, exactly as a browser client would.
 */
export function createHttpAuthPort(input: CreateHttpAuthPortInput): AuthPort {
  return {
    startEmailMagicLink: async (
      magicLinkInput: StartEmailMagicLinkInput,
    ): Promise<AuthStartResult | null> => {
      const url = new URL("/api/auth/magic-link", input.apiBaseUrl);

      url.searchParams.set("email", magicLinkInput.email);
      url.searchParams.set("platform", "mobile");

      await fetch(url.toString());

      return null;
    },

    verifyEmailOtp: async (verifyInput: VerifyEmailOtpInput): Promise<AuthSession> => {
      const response = await fetch(
        new URL("/api/auth/mobile-session/verify-otp", input.apiBaseUrl).toString(),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: verifyInput.email,
            token: verifyInput.token,
          }),
        },
      );

      if (!response.ok) {
        throw new MobileAuthPortVerifyOtpFailedError();
      }

      const body = (await response.json()) as AuthSession;

      return body;
    },

    startOAuth: (oauthInput: StartOAuthInput): Promise<AuthStartResult> => {
      const provider = oauthInput.method === "google_oauth" ? "google" : "apple";
      const url = new URL(`/api/auth/oauth/${provider}`, input.apiBaseUrl);

      url.searchParams.set("platform", "mobile");

      return Promise.resolve({
        redirectUrl: url.toString(),
      });
    },

    exchangeCodeForSession: async (
      exchangeInput: ExchangeCodeForSessionInput,
    ): Promise<AuthSession> => {
      const response = await fetch(
        new URL("/api/auth/mobile-session/exchange", input.apiBaseUrl).toString(),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            handoffId: exchangeInput.code,
          }),
        },
      );

      if (!response.ok) {
        throw new MobileAuthPortExchangeFailedError();
      }

      const body = (await response.json()) as AuthSession;

      return body;
    },

    refreshSession: async (_refreshInput: RefreshSessionInput): Promise<AuthSession> => {
      throw new MobileAuthPortNotYetAvailableError("refreshSession");
    },

    getCurrentIdentity: async (): Promise<AuthIdentity | null> => {
      throw new MobileAuthPortNotYetAvailableError("getCurrentIdentity");
    },

    requireStepUp: async (_stepUpInput: RequireStepUpInput): Promise<void> => {
      throw new MobileAuthPortNotYetAvailableError("requireStepUp");
    },

    revokeSession: async (_revokeInput: RevokeSessionInput): Promise<void> => {
      throw new MobileAuthPortNotYetAvailableError("revokeSession");
    },

    signOut: async (): Promise<void> => {
      await fetch(new URL("/api/auth/sign-out", input.apiBaseUrl).toString(), {
        method: "POST",
      });
    },
  };
}
