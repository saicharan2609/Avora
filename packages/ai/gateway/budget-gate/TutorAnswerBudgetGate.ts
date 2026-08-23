import type {
  TutorAnswerQualityTier,
} from "../invocation/index.js";

// This is a per-task-class ceiling check only (ENG-239), evaluated once per
// invocation. It is deliberately distinct from AiProviderInvocationGate
// (global on/off) and from any per-student entitlement check (billing
// domain) — none of the three implies the others.
export const tutorAnswerBudgetGateVersion =
  "tutor-answer-budget-gate.v1" as const;

export type TutorAnswerBudgetGateVersion =
  typeof tutorAnswerBudgetGateVersion;

export type TutorAnswerTaskBudget = Readonly<{
  maxOutputTokens: number;
}>;

export type TutorAnswerTaskBudgets = Readonly<
  Record<TutorAnswerQualityTier, TutorAnswerTaskBudget>
>;

export type TutorAnswerBudgetAuthorizationFailureCode =
  | "tutor_answer_budget_not_configured"
  | "tutor_answer_budget_invalid_configuration"
  | "tutor_answer_budget_ceiling_exceeded";

export type TutorAnswerBudgetAuthorizationResult =
  | Readonly<{
      authorized: true;
    }>
  | Readonly<{
      authorized: false;
      code: TutorAnswerBudgetAuthorizationFailureCode;
      message: string;
    }>;

export type AuthorizeTutorAnswerBudgetInput = Readonly<{
  qualityTier: TutorAnswerQualityTier;
  requestedMaxOutputTokens: number;
  budgets: TutorAnswerTaskBudgets | undefined;
}>;

export function authorizeTutorAnswerBudget(
  input: AuthorizeTutorAnswerBudgetInput,
): TutorAnswerBudgetAuthorizationResult {
  if (input.budgets === undefined) {
    return {
      authorized: false,
      code: "tutor_answer_budget_not_configured",
      message:
        "Tutor answer task budget configuration was not supplied. Failing closed: refusing to invoke a paid provider.",
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
      code: "tutor_answer_budget_invalid_configuration",
      message:
        "No valid task budget is configured for the requested quality tier. Failing closed: refusing to invoke a paid provider.",
    };
  }

  if (input.requestedMaxOutputTokens > budget.maxOutputTokens) {
    return {
      authorized: false,
      code: "tutor_answer_budget_ceiling_exceeded",
      message:
        "Requested output token budget exceeds the configured task ceiling. Failing closed: refusing to invoke a paid provider.",
    };
  }

  return {
    authorized: true,
  };
}
