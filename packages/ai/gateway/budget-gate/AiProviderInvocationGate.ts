// This is a global on/off authorization gate only. It does not meter, sum,
// or cap cumulative provider spend across requests or students — it answers
// "is any live provider invocation currently permitted at all", not "how
// much has been spent". Aggregate spend protection is a separate, not yet
// implemented concern and must not be assumed satisfied by this gate alone.
export const aiProviderInvocationGateVersion =
  "ai-provider-invocation-gate.v1" as const;

export type AiProviderInvocationGateVersion =
  typeof aiProviderInvocationGateVersion;

export type AiProviderInvocationGateState = "enabled" | "disabled";

export type AiProviderInvocationAuthorizationFailureCode =
  | "ai_provider_invocation_gate_state_missing"
  | "ai_provider_invocation_gate_disabled";

export type AiProviderInvocationAuthorizationResult =
  | Readonly<{
      authorized: true;
    }>
  | Readonly<{
      authorized: false;
      code: AiProviderInvocationAuthorizationFailureCode;
      message: string;
    }>;

export type AuthorizeAiProviderInvocationInput = Readonly<{
  state: AiProviderInvocationGateState | undefined;
}>;

export function authorizeAiProviderInvocation(
  input: AuthorizeAiProviderInvocationInput,
): AiProviderInvocationAuthorizationResult {
  if (input.state === undefined) {
    return {
      authorized: false,
      code: "ai_provider_invocation_gate_state_missing",
      message:
        "AI provider invocation gate state was not supplied. Failing closed: refusing to invoke a paid provider.",
    };
  }

  if (input.state !== "enabled") {
    return {
      authorized: false,
      code: "ai_provider_invocation_gate_disabled",
      message:
        "AI provider invocation gate is not enabled. Failing closed: refusing to invoke a paid provider.",
    };
  }

  return {
    authorized: true,
  };
}
