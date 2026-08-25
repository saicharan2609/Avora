import { randomUUID } from "node:crypto";

import type { CitationId, MessageId } from "@avora/core/identity";
import type { ClockContract, IsoDateTimeString } from "@avora/core/time";
import {
  authorizeAiProviderInvocation,
  authorizeTutorAnswerBudget,
} from "../../gateway/budget-gate/index.js";
import type {
  AiProviderInvocationGateState,
  TutorAnswerTaskBudgets,
} from "../../gateway/budget-gate/index.js";
import { assembleTutorSixPartContext } from "../../gateway/context/index.js";
import { resolveTutorCitations } from "../../gateway/citations/index.js";
import { sealTutorModelInput } from "../../gateway/envelope/index.js";
import type {
  TutorAnswerInvocationInput,
  TutorAnswerInvocationPort,
  TutorAnswerInvocationResult,
} from "../../gateway/invocation/index.js";
import { validateTutorAnswerRawOutput } from "../../gateway/validation/index.js";
import { resolveTutorAnswerRoutingConfig } from "../../gateway/routing/TutorAnswerRoutingPolicy.js";
import type { AiTelemetrySink } from "../../gateway/telemetry/index.js";
import { createTutorSystemPolicy } from "../../prompts/tutor/TutorSystemPolicy.js";
import type { TutorSystemPolicy } from "../../prompts/tutor/TutorSystemPolicy.js";

import { GeminiTutorAnswerAdapterError } from "./GeminiTutorAnswerAdapter.errors.js";
import type { GeminiTutorAnswerClient } from "./GeminiTutorAnswerClient.js";

export type CreateGeminiTutorAnswerAdapterInput = Readonly<{
  client: GeminiTutorAnswerClient;
  invocationGateState: AiProviderInvocationGateState | undefined;
  taskBudgets: TutorAnswerTaskBudgets | undefined;
  telemetrySink?: AiTelemetrySink;
  systemPolicy?: TutorSystemPolicy;
  clock?: ClockContract;
  createAnswerMessageId?: () => MessageId;
  createCitationId?: () => CitationId;
}>;

export function createGeminiTutorAnswerAdapter(
  input: CreateGeminiTutorAnswerAdapterInput,
): TutorAnswerInvocationPort {
  const systemPolicy = input.systemPolicy ?? createTutorSystemPolicy();
  const clock = input.clock ?? { now: defaultNow };
  const createAnswerMessageId =
    input.createAnswerMessageId ?? defaultCreateMessageId;
  const createCitationId = input.createCitationId ?? defaultCreateCitationId;

  return {
    invokeTutorAnswer: async (
      invocation: TutorAnswerInvocationInput,
    ): Promise<TutorAnswerInvocationResult> => {
      const startTimeMs = Date.now();
      const invocationAuthorization = authorizeAiProviderInvocation({
        state: input.invocationGateState,
      });

      if (!invocationAuthorization.authorized) {
        throw new GeminiTutorAnswerAdapterError(
          "gemini_tutor_answer_adapter_invocation_not_authorized",
          invocationAuthorization.message,
        );
      }

      const routingConfig = resolveTutorAnswerRoutingConfig(
        invocation.qualityTier,
      );

      const budgetAuthorization = authorizeTutorAnswerBudget({
        qualityTier: invocation.qualityTier,
        requestedMaxOutputTokens: routingConfig.maxOutputTokens,
        budgets: input.taskBudgets,
      });

      if (!budgetAuthorization.authorized) {
        throw new GeminiTutorAnswerAdapterError(
          "gemini_tutor_answer_adapter_budget_not_authorized",
          budgetAuthorization.message,
        );
      }

      const sixPartContext = assembleTutorSixPartContext({
        query: invocation.query,
        context: invocation.context,
        systemPolicy,
      });

      const sealedInput = sealTutorModelInput(sixPartContext);

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
        throw new GeminiTutorAnswerAdapterError(
          "gemini_tutor_answer_adapter_provider_call_failed",
          "Gemini tutor answer provider call failed.",
          { cause: error },
        );
      }

      if (
        generateContentResult.text === undefined ||
        generateContentResult.text.trim().length === 0
      ) {
        throw new GeminiTutorAnswerAdapterError(
          "gemini_tutor_answer_adapter_empty_response",
          "Gemini tutor answer provider returned an empty response.",
        );
      }

      let parsedOutput: unknown;

      try {
        parsedOutput = JSON.parse(generateContentResult.text);
      } catch (error) {
        throw new GeminiTutorAnswerAdapterError(
          "gemini_tutor_answer_adapter_malformed_json_response",
          "Gemini tutor answer provider returned a response that was not valid JSON.",
          { cause: error },
        );
      }

      const outputValidation = validateTutorAnswerRawOutput(parsedOutput);

      if (!outputValidation.valid) {
        throw new GeminiTutorAnswerAdapterError(
          "gemini_tutor_answer_adapter_output_contract_invalid",
          `Gemini tutor answer provider response did not satisfy the output contract: ${outputValidation.issues.join("; ")}`,
        );
      }

      const citationResolution = resolveTutorCitations({
        envelope: invocation.context,
        rawCitations: outputValidation.value.citations,
        createCitationId,
      });

      if (!citationResolution.resolved) {
        throw new GeminiTutorAnswerAdapterError(
          "gemini_tutor_answer_adapter_citation_resolution_failed",
          "Gemini tutor answer provider cited evidence outside the supplied grounded context envelope.",
        );
      }

      if (input.telemetrySink !== undefined) {
        const latencyMs = Math.max(0, Date.now() - startTimeMs);
        const estimatedInputTokens =
          Math.ceil(sealedInput.systemInstructionText.length / 4) +
          Math.ceil(JSON.stringify(sealedInput.dataPayload).length / 4);
        const estimatedOutputTokens = Math.ceil(
          outputValidation.value.answerText.length / 4,
        );

        await input.telemetrySink({
          version: "ai-cost-telemetry.v1",
          task: "tutor.answer",
          model: routingConfig.model,
          qualityTier: invocation.qualityTier,
          latencyMs,
          estimatedInputTokens,
          estimatedOutputTokens,
          timestamp: clock.now(),
        });
      }

      return {
        candidate: {
          answerMessageId: createAnswerMessageId(),
          answerText: outputValidation.value.answerText,
          citations: citationResolution.citations,
          createdAt: clock.now(),
        },
      };
    },
  };
}

function defaultNow(): IsoDateTimeString {
  return new Date().toISOString() as IsoDateTimeString;
}

function defaultCreateMessageId(): MessageId {
  return randomUUID() as MessageId;
}

function defaultCreateCitationId(): CitationId {
  return randomUUID() as CitationId;
}
