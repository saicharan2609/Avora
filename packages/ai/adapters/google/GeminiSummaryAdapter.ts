import { randomUUID } from "node:crypto";

import type { CitationId } from "@avora/core/identity";
import type { ClockContract, IsoDateTimeString } from "@avora/core/time";
import {
  authorizeAiProviderInvocation,
  authorizeSummaryGenerationBudget,
} from "../../gateway/budget-gate/index.js";
import type {
  AiProviderInvocationGateState,
  SummaryGenerationTaskBudgets,
} from "../../gateway/budget-gate/index.js";
import { assembleSummarySixPartContext } from "../../gateway/context/index.js";
import { resolveSummaryCitations } from "../../gateway/citations/index.js";
import { sealSummaryModelInput } from "../../gateway/envelope/index.js";
import type {
  SummaryCandidate,
  SummaryInvocationInput,
  SummaryInvocationPort,
  SummaryInvocationResult,
} from "../../gateway/invocation/index.js";
import { validateSummaryRawOutput } from "../../gateway/validation/index.js";
import { resolveSummaryRoutingConfig } from "../../gateway/routing/SummaryRoutingPolicy.js";
import type { AiTelemetrySink } from "../../gateway/telemetry/index.js";
import { createSummarySystemPolicy } from "../../prompts/summary/SummarySystemPolicy.js";
import type { SummarySystemPolicy } from "../../prompts/summary/SummarySystemPolicy.js";

import { GeminiSummaryAdapterError } from "./GeminiSummaryAdapter.errors.js";
import type { GeminiSummaryClient } from "./GeminiSummaryClient.js";

export type CreateGeminiSummaryAdapterInput = Readonly<{
  client: GeminiSummaryClient;
  invocationGateState: AiProviderInvocationGateState | undefined;
  taskBudgets: SummaryGenerationTaskBudgets | undefined;
  telemetrySink?: AiTelemetrySink;
  systemPolicy?: SummarySystemPolicy;
  clock?: ClockContract;
  createCitationId?: () => CitationId;
}>;

export function createGeminiSummaryAdapter(
  input: CreateGeminiSummaryAdapterInput,
): SummaryInvocationPort {
  const systemPolicy = input.systemPolicy ?? createSummarySystemPolicy();
  const clock = input.clock ?? { now: defaultNow };
  const createCitationId = input.createCitationId ?? defaultCreateCitationId;

  return {
    invokeSummaryGeneration: async (
      invocation: SummaryInvocationInput,
    ): Promise<SummaryInvocationResult> => {
      const startTimeMs = Date.now();

      const invocationAuthorization = authorizeAiProviderInvocation({
        state: input.invocationGateState,
      });

      if (!invocationAuthorization.authorized) {
        throw new GeminiSummaryAdapterError(
          "gemini_summary_adapter_invocation_not_authorized",
          invocationAuthorization.message,
        );
      }

      const routingConfig = resolveSummaryRoutingConfig(invocation.qualityTier);

      const budgetAuthorization = authorizeSummaryGenerationBudget({
        qualityTier: invocation.qualityTier,
        requestedMaxOutputTokens: routingConfig.maxOutputTokens,
        budgets: input.taskBudgets,
      });

      if (!budgetAuthorization.authorized) {
        throw new GeminiSummaryAdapterError(
          "gemini_summary_adapter_budget_not_authorized",
          budgetAuthorization.message,
        );
      }

      const sixPartContext = assembleSummarySixPartContext({
        query: invocation.query,
        context: invocation.context,
        systemPolicy,
      });

      const sealedInput = sealSummaryModelInput(sixPartContext);

      let generateContentResult;

      try {
        generateContentResult = await input.client.generateContent({
          model: routingConfig.model,
          systemInstructionText: sealedInput.systemInstructionText,
          userContentText: JSON.stringify(sealedInput.dataPayload),
          temperature: routingConfig.temperature,
          maxOutputTokens: routingConfig.maxOutputTokens,
          responseMimeType: routingConfig.responseMimeType,
        });
      } catch (error) {
        throw new GeminiSummaryAdapterError(
          "gemini_summary_adapter_provider_call_failed",
          "Gemini summary provider call failed.",
          { cause: error },
        );
      }

      const rawText = generateContentResult.text;

      if (rawText === undefined || rawText.trim().length === 0) {
        throw new GeminiSummaryAdapterError(
          "gemini_summary_adapter_empty_response",
          "Gemini summary provider returned an empty response.",
        );
      }

      let parsedOutput: unknown;

      try {
        parsedOutput = JSON.parse(rawText);
      } catch (error) {
        throw new GeminiSummaryAdapterError(
          "gemini_summary_adapter_malformed_json_response",
          "Gemini summary provider returned a response that was not valid JSON.",
          { cause: error },
        );
      }

      const outputValidation = validateSummaryRawOutput(parsedOutput);

      if (!outputValidation.valid) {
        throw new GeminiSummaryAdapterError(
          "gemini_summary_adapter_output_contract_invalid",
          `Gemini summary provider response did not satisfy the output contract: ${outputValidation.issues.join("; ")}`,
        );
      }

      const citationResolution = resolveSummaryCitations({
        envelope: invocation.context,
        rawCitations: outputValidation.value.citations,
        createCitationId,
      });

      if (!citationResolution.resolved) {
        throw new GeminiSummaryAdapterError(
          "gemini_summary_adapter_citation_resolution_failed",
          "Gemini summary provider cited evidence outside the supplied grounded context envelope.",
        );
      }

      if (input.telemetrySink !== undefined) {
        const latencyMs = Math.max(0, Date.now() - startTimeMs);
        const estimatedInputTokens =
          Math.ceil(sealedInput.systemInstructionText.length / 4) +
          Math.ceil(JSON.stringify(sealedInput.dataPayload).length / 4);
        const estimatedOutputTokens = Math.ceil(rawText.length / 4);

        await input.telemetrySink({
          version: "ai-cost-telemetry.v1",
          task: "summary.generate",
          model: routingConfig.model,
          qualityTier: invocation.qualityTier,
          latencyMs,
          estimatedInputTokens,
          estimatedOutputTokens,
          timestamp: clock.now(),
        });
      }

      const candidate: SummaryCandidate = {
        body: { headings: outputValidation.value.headings },
        citations: citationResolution.citations,
        modelVersion: routingConfig.model,
        createdAt: clock.now(),
      };

      return { candidate };
    },
  };
}

function defaultNow(): IsoDateTimeString {
  return new Date().toISOString() as IsoDateTimeString;
}

function defaultCreateCitationId(): CitationId {
  return randomUUID() as CitationId;
}
