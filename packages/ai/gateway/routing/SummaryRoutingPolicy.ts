import type {
  SummaryQualityTier,
} from "../invocation/index.js";

export const summaryRoutingPolicyVersion =
  "summary-routing-policy.v1" as const;

export type SummaryRoutingPolicyVersion =
  typeof summaryRoutingPolicyVersion;

export type SummaryRoutingProvider = "gemini";

export type SummaryRoutingConfig = Readonly<{
  provider: SummaryRoutingProvider;
  model: string;
  temperature: number;
  maxOutputTokens: number;
  responseMimeType: "application/json";
}>;

// architecture.md section 20 specifies a mid-tier model for automatic
// per-resource summaries ("Generate summary, mid-tier model"), distinct
// from the strong model used for on-demand, synthesised Notes (FR-071, a
// later, distinct feature). This reuses the same gemini-3.6-flash
// configuration already approved for the tutor "standard" tier
// (TutorAnswerRoutingPolicy.ts) rather than introducing a new model
// selection.
const summaryRoutingPolicy: Readonly<
  Record<SummaryQualityTier, SummaryRoutingConfig>
> = {
  standard: {
    provider: "gemini",
    model: "gemini-3.6-flash",
    temperature: 0.2,
    maxOutputTokens: 2048,
    responseMimeType: "application/json",
  },
};

export function resolveSummaryRoutingConfig(
  qualityTier: SummaryQualityTier,
): SummaryRoutingConfig {
  return summaryRoutingPolicy[qualityTier];
}
