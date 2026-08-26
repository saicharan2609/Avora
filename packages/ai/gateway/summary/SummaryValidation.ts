import {
  validateSummaryCitations,
} from "./Citation.js";
import type {
  SummaryCitationValidationIssue,
} from "./Citation.js";
import type {
  GeneratedSummary,
} from "./GeneratedSummary.js";

export type GeneratedSummaryValidationIssueCode =
  | "generated_summary_empty_body"
  | "generated_summary_empty_heading"
  | "generated_summary_missing_citation"
  | "generated_summary_invalid_citation";

export type GeneratedSummaryValidationIssue = Readonly<{
  code: GeneratedSummaryValidationIssueCode;
  message: string;
  citationIssues: readonly SummaryCitationValidationIssue[];
}>;

export type GeneratedSummaryValidationResult =
  | Readonly<{
      valid: true;
    }>
  | Readonly<{
      valid: false;
      issues: readonly GeneratedSummaryValidationIssue[];
    }>;

export function validateGeneratedSummary(
  summary: GeneratedSummary,
): GeneratedSummaryValidationResult {
  const issues: GeneratedSummaryValidationIssue[] = [];

  if (summary.body.headings.length === 0) {
    issues.push({
      code: "generated_summary_empty_body",
      message: "Generated summary must contain at least one heading.",
      citationIssues: [],
    });
  }

  for (const heading of summary.body.headings) {
    if (heading.title.trim().length === 0 || heading.points.length === 0) {
      issues.push({
        code: "generated_summary_empty_heading",
        message: "Generated summary heading requires a non-empty title and at least one point.",
        citationIssues: [],
      });
    }
  }

  if (summary.citations.length === 0) {
    issues.push({
      code: "generated_summary_missing_citation",
      message: "Generated summaries must include at least one citation.",
      citationIssues: [],
    });
  }

  const citationValidation = validateSummaryCitations({
    envelope: summary.context,
    citations: summary.citations,
  });

  if (!citationValidation.valid) {
    issues.push({
      code: "generated_summary_invalid_citation",
      message: "Generated summary contains citations that do not resolve to the supplied context.",
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
