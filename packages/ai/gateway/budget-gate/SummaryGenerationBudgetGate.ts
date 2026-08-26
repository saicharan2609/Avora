import type {
  SummaryQualityTier,
} from "../invocation/index.js";

// This is a per-task-class ceiling check only (ENG-239), evaluated once per
// invocation, mirroring TutorAnswerBudgetGate.ts exactly for the
// summary.generate task. Deliberately distinct from
// AiProviderInvocationGate (global on/off) and from any per-student
// entitlement check (billing domain).
export const summaryGenerationBudgetGateVersion =
  "summary-generation-budget-gate.v1" as const;

export type SummaryGenerationBudgetGateVersion =
  typeof summaryGenerationBudgetGateVersion;

export type SummaryGenerationTaskBudget = Readonly<{
  maxOutputTokens: number;
}>;

export type SummaryGenerationTaskBudgets = Readonly<
  Record<SummaryQualityTier, SummaryGenerationTaskBudget>
>;

export type SummaryGenerationBudgetAuthorizationFailureCode =
  | "summary_generation_budget_not_configured"
  | "summary_generation_budget_invalid_configuration"
  | "summary_generation_budget_ceiling_exceeded";

export type SummaryGenerationBudgetAuthorizationResult =
  | Readonly<{
      authorized: true;
    }>
  | Readonly<{
      authorized: false;
      code: SummaryGenerationBudgetAuthorizationFailureCode;
      message: string;
    }>;

export type AuthorizeSummaryGenerationBudgetInput = Readonly<{
  qualityTier: SummaryQualityTier;
  requestedMaxOutputTokens: number;
  budgets: SummaryGenerationTaskBudgets | undefined;
}>;

export function authorizeSummaryGenerationBudget(
  input: AuthorizeSummaryGenerationBudgetInput,
): SummaryGenerationBudgetAuthorizationResult {
  if (input.budgets === undefined) {
    return {
      authorized: false,
      code: "summary_generation_budget_not_configured",
      message:
        "Summary generation task budget configuration was not supplied. Failing closed: refusing to invoke a paid provider.",
    };
  }

  const budget = input.budgets[input.qualityTier];

  if (
    budget === undefined ||
    !Number.isSafeInteger(budget.maxOutputTokens) ||
    budget.maxOutputTokens <= 0
  ) {
    return {
      authorized: false,
      code: "summary_generation_budget_invalid_configuration",
      message:
        "No valid task budget is configured for the requested quality tier. Failing closed: refusing to invoke a paid provider.",
    };
  }

  if (input.requestedMaxOutputTokens > budget.maxOutputTokens) {
    return {
      authorized: false,
      code: "summary_generation_budget_ceiling_exceeded",
      message:
        "Requested output token budget exceeds the configured task ceiling. Failing closed: refusing to invoke a paid provider.",
    };
  }

  return {
    authorized: true,
  };
}
