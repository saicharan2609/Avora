import type { RetrievalSearchPort } from "@avora/retrieval/search";

import type {
  TutorAnswerCandidate,
  TutorAnswerInvocationPort,
  TutorAnswerQualityTier,
} from "../invocation/index.js";
import { tutorAnswerTask } from "../invocation/index.js";
import { createAIInsufficiencyResponse } from "./AIInsufficiencyResponse.js";
import { createGroundedContextEnvelope } from "./GroundedContextEnvelope.js";
import type { GroundedContextEnvelope } from "./GroundedContextEnvelope.js";
import { createAIRefusalResponse } from "./GroundedAnswer.js";
import type { GroundedAnswer, TutorGatewayResponse } from "./GroundedAnswer.js";
import { validateGroundedAnswer } from "./AnswerValidation.js";
import { createScopedSearchInputFromTutorQuery } from "./TutorQuery.js";
import type { TutorQuery } from "./TutorQuery.js";
import { TutorGatewayError } from "./TutorGatewayError.js";

export type TutorGatewayStreamEvent =
  | Readonly<{
      type: "token";
      token: string;
    }>
  | Readonly<{
      type: "final";
      response: TutorGatewayResponse;
    }>;

export type TutorGatewayPort = Readonly<{
  answerTutorQuery: (query: TutorQuery) => Promise<TutorGatewayResponse>;
  streamTutorQuery: (
    query: TutorQuery,
  ) => AsyncIterable<TutorGatewayStreamEvent>;
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

  const resolveContextOrInsufficiency = async (
    query: TutorQuery,
  ): Promise<
    | { kind: "context"; context: GroundedContextEnvelope }
    | { kind: "insufficiency"; response: TutorGatewayResponse }
  > => {
    const scopedSearchInput = createScopedSearchInputFromTutorQuery({
      query,
      maxChunks: input.defaults.maxChunks,
      minChunkCount: input.defaults.minChunkCount,
    });

    const scopedSearchResult =
      await input.retrievalSearch.search(scopedSearchInput);

    if (scopedSearchResult.sufficiency.insufficient) {
      return {
        kind: "insufficiency",
        response: createAIInsufficiencyResponse({
          query,
          retrieval: scopedSearchResult.sufficiency,
        }),
      };
    }

    const context = createGroundedContextEnvelope({
      query,
      scopedSearchResult,
    });

    if (context.evidence.length === 0 || context.allowedChunkIds.length === 0) {
      return {
        kind: "insufficiency",
        response: createAIInsufficiencyResponse({
          query,
          retrieval: null,
        }),
      };
    }

    return { kind: "context", context };
  };

  const validateCandidateToFinalResponse = (
    candidate: TutorAnswerCandidate,
    query: TutorQuery,
    context: GroundedContextEnvelope,
  ): TutorGatewayResponse => {
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
  };

  return {
    answerTutorQuery: async (
      query: TutorQuery,
    ): Promise<TutorGatewayResponse> => {
      const resolved = await resolveContextOrInsufficiency(query);
      if (resolved.kind === "insufficiency") {
        return resolved.response;
      }

      let candidate: TutorAnswerCandidate;

      try {
        candidate = await invokeTutorAnswerSafely({
          input,
          query,
          context: resolved.context,
        });
      } catch {
        return createAIRefusalResponse({
          query,
          reason: "invocation_failed",
          message:
            "I could not produce a grounded answer from your materials right now.",
        });
      }

      return validateCandidateToFinalResponse(
        candidate,
        query,
        resolved.context,
      );
    },

    streamTutorQuery: async function* (
      query: TutorQuery,
    ): AsyncIterable<TutorGatewayStreamEvent> {
      const resolved = await resolveContextOrInsufficiency(query);
      if (resolved.kind === "insufficiency") {
        yield { type: "final", response: resolved.response };
        return;
      }

      if (input.tutorAnswerInvocation.streamTutorAnswer === undefined) {
        let candidate: TutorAnswerCandidate;
        try {
          candidate = await invokeTutorAnswerSafely({
            input,
            query,
            context: resolved.context,
          });
        } catch {
          yield {
            type: "final",
            response: createAIRefusalResponse({
              query,
              reason: "invocation_failed",
              message:
                "I could not produce a grounded answer from your materials right now.",
            }),
          };
          return;
        }

        yield {
          type: "final",
          response: validateCandidateToFinalResponse(
            candidate,
            query,
            resolved.context,
          ),
        };
        return;
      }

      let finalCandidate: TutorAnswerCandidate | null = null;

      try {
        const stream = input.tutorAnswerInvocation.streamTutorAnswer({
          task: tutorAnswerTask,
          qualityTier: input.defaults.qualityTier,
          query,
          context: resolved.context,
        });

        for await (const event of stream) {
          if (event.type === "token") {
            yield { type: "token", token: event.token };
          } else if (event.type === "completed") {
            finalCandidate = event.candidate;
          }
        }
      } catch {
        yield {
          type: "final",
          response: createAIRefusalResponse({
            query,
            reason: "invocation_failed",
            message:
              "I could not produce a grounded answer from your materials right now.",
          }),
        };
        return;
      }

      if (finalCandidate === null) {
        yield {
          type: "final",
          response: createAIRefusalResponse({
            query,
            reason: "invocation_failed",
            message:
              "I could not produce a grounded answer from your materials right now.",
          }),
        };
        return;
      }

      yield {
        type: "final",
        response: validateCandidateToFinalResponse(
          finalCandidate,
          query,
          resolved.context,
        ),
      };
    },
  };
}

async function invokeTutorAnswerSafely(
  input: Readonly<{
    input: CreateTutorGatewayInput;
    query: TutorQuery;
    context: Parameters<
      TutorAnswerInvocationPort["invokeTutorAnswer"]
    >[0]["context"];
  }>,
): Promise<TutorAnswerCandidate> {
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
    !Number.isSafeInteger(defaults.minChunkCount) ||
    defaults.minChunkCount <= 0
  ) {
    throw new TutorGatewayError(
      "tutor_gateway_provider_invocation_failed",
      "Tutor Gateway minChunkCount default must be a positive safe integer.",
    );
  }
}