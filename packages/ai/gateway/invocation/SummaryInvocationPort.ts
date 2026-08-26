import type {
  GroundedSummaryContextEnvelope,
  SummaryBody,
  SummaryCitation,
  SummaryQuery,
} from "../summary/index.js";

export const summaryGenerationTask = "summary.generate" as const;

// architecture.md section 20 and the roadmap Group 7 entry specify a single
// mid-tier model for automatic per-resource summaries — unlike
// tutor.answer's standard/high tiers, this task has exactly one quality
// tier. The array/type shape still mirrors TutorAnswerQualityTier so a
// second tier can be added later without a structural change.
export const summaryQualityTiers = [
  "standard",
] as const;

export type SummaryGenerationTask = typeof summaryGenerationTask;

export type SummaryQualityTier =
  (typeof summaryQualityTiers)[number];

export type SummaryInvocationInput = Readonly<{
  task: SummaryGenerationTask;
  qualityTier: SummaryQualityTier;
  query: SummaryQuery;
  context: GroundedSummaryContextEnvelope;
}>;

export type SummaryCandidate = Readonly<{
  body: SummaryBody;
  citations: readonly SummaryCitation[];
  // The concrete provider model identifier selected by
  // resolveSummaryRoutingConfig for this invocation (e.g.
  // "gemini-3.6-flash"), stamped through to persistence per ENG-235.
  modelVersion: string;
  createdAt: SummaryQuery["requestedAt"];
}>;

export type SummaryInvocationResult = Readonly<{
  candidate: SummaryCandidate;
}>;

export type SummaryInvocationPort = Readonly<{
  invokeSummaryGeneration: (
    input: SummaryInvocationInput,
  ) => Promise<SummaryInvocationResult>;
}>;
