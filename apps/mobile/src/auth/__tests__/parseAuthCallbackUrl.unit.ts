import { parseAuthCallbackHandoffId } from "../parseAuthCallbackUrl.js";

class ParseAuthCallbackUrlUnitFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "ParseAuthCallbackUrlUnitFailure";
  }
}

function assert(condition: boolean, caseId: string, reason: string): asserts condition {
  if (!condition) {
    throw new ParseAuthCallbackUrlUnitFailure(caseId, reason);
  }
}

function runExtractsHandoffIdCase(): void {
  const caseId = "extracts the handoffId query parameter";

  const handoffId = parseAuthCallbackHandoffId(
    "avora://auth-callback?handoffId=11111111-1111-4111-8111-111111111111",
  );

  assert(
    handoffId === "11111111-1111-4111-8111-111111111111",
    caseId,
    `unexpected handoffId: ${String(handoffId)}`,
  );
}

function runReturnsNullWhenHandoffIdMissingCase(): void {
  const caseId = "returns null when handoffId is absent";

  const handoffId = parseAuthCallbackHandoffId("avora://auth-callback");

  assert(handoffId === null, caseId, `expected null, got: ${String(handoffId)}`);
}

function runNeverExtractsBearerTokenFieldsCase(): void {
  const caseId =
    "never treats accessToken/refreshToken query parameters as valid on their own - handoffId is required";

  const handoffId = parseAuthCallbackHandoffId(
    "avora://auth-callback?accessToken=leaked-token&refreshToken=leaked-refresh",
  );

  assert(
    handoffId === null,
    caseId,
    "a callback url without handoffId must never be treated as a valid sign-in completion",
  );
}

function main(): void {
  runExtractsHandoffIdCase();
  runReturnsNullWhenHandoffIdMissingCase();
  runNeverExtractsBearerTokenFieldsCase();
}

main();
