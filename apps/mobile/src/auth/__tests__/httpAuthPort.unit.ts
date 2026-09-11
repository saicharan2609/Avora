import {
  createHttpAuthPort,
  MobileAuthPortExchangeFailedError,
  MobileAuthPortVerifyOtpFailedError,
} from "../httpAuthPort.js";

class HttpAuthPortUnitFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "HttpAuthPortUnitFailure";
  }
}

function assert(condition: boolean, caseId: string, reason: string): asserts condition {
  if (!condition) {
    throw new HttpAuthPortUnitFailure(caseId, reason);
  }
}

async function withStubbedFetch<T>(
  stub: typeof fetch,
  run: () => Promise<T>,
): Promise<T> {
  const original = globalThis.fetch;
  globalThis.fetch = stub;

  try {
    return await run();
  } finally {
    globalThis.fetch = original;
  }
}

async function runStartOAuthBuildsMobilePlatformRedirectUrlCase(): Promise<void> {
  const caseId = "startOAuth builds a mobile-flagged redirect url";
  const authPort = createHttpAuthPort({ apiBaseUrl: "https://app.avora.ai" });

  const result = await authPort.startOAuth({
    method: "google_oauth",
    redirectTo: "avora://auth-callback",
  });

  assert(
    result.redirectUrl === "https://app.avora.ai/api/auth/oauth/google?platform=mobile",
    caseId,
    `unexpected redirect url: ${result.redirectUrl}`,
  );
}

async function runStartOAuthMapsAppleMethodCase(): Promise<void> {
  const caseId = "startOAuth maps apple_sign_in to the apple provider path";
  const authPort = createHttpAuthPort({ apiBaseUrl: "https://app.avora.ai" });

  const result = await authPort.startOAuth({
    method: "apple_sign_in",
    redirectTo: "avora://auth-callback",
  });

  assert(
    result.redirectUrl === "https://app.avora.ai/api/auth/oauth/apple?platform=mobile",
    caseId,
    `unexpected redirect url: ${result.redirectUrl}`,
  );
}

async function runExchangeCodeForSessionReturnsParsedSessionOnSuccessCase(): Promise<void> {
  const caseId = "exchangeCodeForSession returns the session body on a 200 response";
  const authPort = createHttpAuthPort({ apiBaseUrl: "https://app.avora.ai" });

  const session = await withStubbedFetch(
    (async () =>
      new Response(
        JSON.stringify({
          studentId: "student-1",
          accessToken: "access-1",
          refreshToken: "refresh-1",
          expiresAt: "2026-01-01T00:00:00.000Z",
        }),
        { status: 200 },
      )) as typeof fetch,
    () => authPort.exchangeCodeForSession({ code: "handoff-1" }),
  );

  assert(session.studentId === "student-1", caseId, "expected the studentId from the response body");
  assert(session.accessToken === "access-1", caseId, "expected the accessToken from the response body");
}

async function runExchangeCodeForSessionThrowsOnFailureWithoutLeakingDetailCase(): Promise<void> {
  const caseId = "exchangeCodeForSession throws a generic error on a non-2xx response";
  const authPort = createHttpAuthPort({ apiBaseUrl: "https://app.avora.ai" });

  let thrown: unknown = null;

  try {
    await withStubbedFetch(
      (async () => new Response(JSON.stringify({ error: "handoff_expired_or_already_used" }), { status: 410 })) as typeof fetch,
      () => authPort.exchangeCodeForSession({ code: "handoff-expired" }),
    );
  } catch (error) {
    thrown = error;
  }

  assert(thrown instanceof MobileAuthPortExchangeFailedError, caseId, "expected MobileAuthPortExchangeFailedError");
}

async function runVerifyEmailOtpReturnsParsedSessionOnSuccessCase(): Promise<void> {
  const caseId = "verifyEmailOtp returns the session body on a 200 response";
  const authPort = createHttpAuthPort({ apiBaseUrl: "https://app.avora.ai" });

  const session = await withStubbedFetch(
    (async () =>
      new Response(
        JSON.stringify({
          studentId: "student-1",
          accessToken: "access-1",
          refreshToken: "refresh-1",
          expiresAt: "2026-01-01T00:00:00.000Z",
        }),
        { status: 200 },
      )) as typeof fetch,
    () => authPort.verifyEmailOtp({ email: "student@example.com", token: "123456" }),
  );

  assert(session.studentId === "student-1", caseId, "expected the studentId from the response body");
  assert(session.accessToken === "access-1", caseId, "expected the accessToken from the response body");
}

async function runVerifyEmailOtpThrowsOnFailureWithoutLeakingDetailCase(): Promise<void> {
  const caseId = "verifyEmailOtp throws a generic error on a non-2xx response";
  const authPort = createHttpAuthPort({ apiBaseUrl: "https://app.avora.ai" });

  let thrown: unknown = null;

  try {
    await withStubbedFetch(
      (async () => new Response(JSON.stringify({ error: "auth_verify_email_otp_failed" }), { status: 401 })) as typeof fetch,
      () => authPort.verifyEmailOtp({ email: "student@example.com", token: "000000" }),
    );
  } catch (error) {
    thrown = error;
  }

  assert(thrown instanceof MobileAuthPortVerifyOtpFailedError, caseId, "expected MobileAuthPortVerifyOtpFailedError");
}

async function main(): Promise<void> {
  await runStartOAuthBuildsMobilePlatformRedirectUrlCase();
  await runStartOAuthMapsAppleMethodCase();
  await runExchangeCodeForSessionReturnsParsedSessionOnSuccessCase();
  await runExchangeCodeForSessionThrowsOnFailureWithoutLeakingDetailCase();
  await runVerifyEmailOtpReturnsParsedSessionOnSuccessCase();
  await runVerifyEmailOtpThrowsOnFailureWithoutLeakingDetailCase();
}

await main();
