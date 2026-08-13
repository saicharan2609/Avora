import {
  validateCitations,
} from "./Citation.js";
import type {
  CitationValidationIssue,
} from "./Citation.js";
import type {
  GroundedAnswer,
} from "./GroundedAnswer.js";

export type GroundedAnswerValidationIssueCode =
  | "grounded_answer_empty"
  | "grounded_answer_missing_citation"
  | "grounded_answer_invalid_citation";

export type GroundedAnswerValidationIssue = Readonly<{
  code: GroundedAnswerValidationIssueCode;
  message: string;
  citationIssues: readonly CitationValidationIssue[];
}>;

export type GroundedAnswerValidationResult =
  | Readonly<{
      valid: true;
    }>
  | Readonly<{
      valid: false;
      issues: readonly GroundedAnswerValidationIssue[];
    }>;

export function validateGroundedAnswer(
  answer: GroundedAnswer,
): GroundedAnswerValidationResult {
  const issues: GroundedAnswerValidationIssue[] = [];

  if (answer.answerText.trim().length === 0) {
    issues.push({
      code: "grounded_answer_empty",
      message: "Grounded answer text must not be empty.",
      citationIssues: [],
    });
  }

  if (answer.citations.length === 0) {
    issues.push({
      code: "grounded_answer_missing_citation",
      message: "Grounded answers must include at least one citation.",
      citationIssues: [],
    });
  }

  const citationValidation = validateCitations({
    envelope: answer.context,
    citations: answer.citations,
  });

  if (!citationValidation.valid) {
    issues.push({
      code: "grounded_answer_invalid_citation",
      message: "Grounded answer contains citations that do not resolve to the supplied context.",
      citationIssues: citationValidation.issues,
    });
  }

  return issues.length === 0
    ? { valid: true }
    : {
        valid: false,
        issues,
      };
}