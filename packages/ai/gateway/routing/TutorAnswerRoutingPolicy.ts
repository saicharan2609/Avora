import type {
  TutorAnswerQualityTier,
} from "../invocation/index.js";

export const tutorAnswerRoutingPolicyVersion =
  "tutor-answer-routing-policy.v1" as const;

export type TutorAnswerRoutingPolicyVersion =
  typeof tutorAnswerRoutingPolicyVersion;

export type TutorAnswerRoutingProvider = "gemini";

export type TutorAnswerRoutingConfig = Readonly<{
  provider: TutorAnswerRoutingProvider;
  model: string;
  temperature: number;
  maxOutputTokens: number;
  responseMimeType: "application/json";
}>;

const tutorAnswerRoutingPolicy: Readonly<
  Record<TutorAnswerQualityTier, TutorAnswerRoutingConfig>
> = {
  standard: {
    provider: "gemini",
    model: "gemini-3.6-flash",
    temperature: 0.2,
    maxOutputTokens: 4096,
    responseMimeType: "application/json",
  },
  high: {
    provider: "gemini",
    model: "gemini-3.1-pro-preview",
    temperature: 0.2,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  },
};

export function resolveTutorAnswerRoutingConfig(
  qualityTier: TutorAnswerQualityTier,
): TutorAnswerRoutingConfig {
  return tutorAnswerRoutingPolicy[qualityTier];
}
