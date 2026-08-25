import type { IsoDateTimeString } from "@avora/core/time";
import type { TutorAnswerQualityTier } from "../invocation/index.js";

export const aiCostTelemetryVersion = "ai-cost-telemetry.v1" as const;

export type AiCostTelemetryVersion = typeof aiCostTelemetryVersion;

export type AiTaskIdentifier =
  "tutor.answer" | "resource.summary" | "resource.classification";

export type AiCostTelemetry = Readonly<{
  version: AiCostTelemetryVersion;
  task: AiTaskIdentifier;
  model: string;
  qualityTier: TutorAnswerQualityTier;
  latencyMs: number;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  timestamp: IsoDateTimeString;
}>;

export type AiTelemetrySink = (
  telemetry: AiCostTelemetry,
) => void | Promise<void>;
