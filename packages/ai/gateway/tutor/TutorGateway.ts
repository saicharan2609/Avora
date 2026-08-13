import type {
  RetrievalInsufficiency,
} from "@avora/retrieval/insufficiency";
import type {
  RetrievalSearchPort,
} from "@avora/retrieval/search";

import type {
  TutorAnswerInvocationPort,
  TutorAnswerQualityTier,
} from "../invocation/index.js";
import {
  tutorAnswerTask,
} from "../invocation/index.js";
import {
  createAIInsufficiencyResponse,
} from "./AIInsufficiencyResponse.js";
import {
  createGroundedContextEnvelope,
} from "./GroundedContextEnvelope.js";
import {
  createAIRefusalResponse,
} from "./GroundedAnswer.js";
import type {
  GroundedAnswer,
  TutorGatewayResponse,
} from "./GroundedAnswer.js";
import {
  validateGroundedAnswer,
} from "./AnswerValidation.js";
import {
  createScopedSearchInputFromTutorQuery,
} from "./TutorQuery.js";
import type {
  TutorQuery,
} from "./TutorQuery.js";
import {
  TutorGatewayError,
} from "./TutorGatewayError.js";

export type TutorGatewayPort = Readonly<{
  answerTutorQuery: (query: TutorQuery) => Promise<TutorGatewayResponse>;
}>;

export type CreateTutorGatewayInput = Readonly<{
  retrievalSearch: RetrievalSearchPort;
  tutorAnswerInvocation: TutorAnswerInvocationPort;
  defaults: TutorGatewayDefaults;
}>;

export type TutorGatewayDefaults = Readonly<{
  maxChunks: number;
  minChunkCount: number;
  qualityTier: TutorAnswerQualityTier;
}>;

export function createTutorGateway(
  input: CreateTutorGatewayInput,
): TutorGatewayPort {
  assertValidTutorGatewayDefaults(input.defaults);

  return {
    answerTutorQuery: async (
      query: TutorQuery,
    ): Promise<TutorGatewayResponse> => {
      const scopedSearchInput = createScopedSearchInputFromTutorQuery({
        query,
        maxChunks: input.defaults.maxChunks,
        minChunkCount: input.defaults.minChunkCount,
      });

      const scopedSearchResult =
        await input.retrievalSearch.search(scopedSearchInput);

      if (scopedSearchResult.sufficiency.insufficient) {
        return createAIInsufficiencyResponse({
          query,
          retrieval: scopedSearchResult.sufficiency,
        });
      }

      const context = createGroundedContextEnvelope({
        query,
        scopedSearchResult,
      });

      if (context.evidence.length === 0 || context.allowedChunkIds.length === 0) {
        return createAIInsufficiencyResponse({
          query,
          retrieval: null,
        });
      }

      const candidate = await invokeTutorAnswerSafely({
        input,
        query,
        context,
      });

      const groundedAnswer: GroundedAnswer = {
        status: "answered",
        answerMessageId: candidate.answerMessageId,
        query,
        context,
        answerText: candidate.answerText,
        citations: candidate.citations,
        createdAt: candidate.createdAt,
      };

      const validation = validateGroundedAnswer(groundedAnswer);

      if (!validation.valid) {
        return createAIRefusalResponse({
          query,
          reason: "citation_validation_failed",
          message:
            "I could not produce a grounded answer with valid citations from your materials.",
        });
      }

      return groundedAnswer;
    },
  };
}

async function invokeTutorAnswerSafely(
  input: Readonly<{
    input: CreateTutorGatewayInput;
    query: TutorQuery;
    context: Parameters<TutorAnswerInvocationPort["invokeTutorAnswer"]>[0]["context"];
  }>,
) {
  try {
    const result = await input.input.tutorAnswerInvocation.invokeTutorAnswer({
      task: tutorAnswerTask,
      qualityTier: input.input.defaults.qualityTier,
      query: input.query,
      context: input.context,
    });

    return result.candidate;
  } catch (error) {
    throw new TutorGatewayError(
      "tutor_gateway_provider_invocation_failed",
      "Tutor Gateway provider invocation failed.",
      { cause: error },
    );
  }
}

function assertValidTutorGatewayDefaults(
  defaults: TutorGatewayDefaults,
): void {
  if (!Number.isSafeInteger(defaults.maxChunks) || defaults.maxChunks <= 0) {
    throw new TutorGatewayError(
      "tutor_gateway_provider_invocation_failed",
      "Tutor Gateway maxChunks default must be a positive safe integer.",
    );
  }

  if (
    !Number.isSafeInteger(defaults.minChunkCount)
    || defaults.minChunkCount <= 0
  ) {
    throw new TutorGatewayError(
      "tutor_gateway_provider_invocation_failed",
      "Tutor Gateway minChunkCount default must be a positive safe integer.",
    );
  }
}