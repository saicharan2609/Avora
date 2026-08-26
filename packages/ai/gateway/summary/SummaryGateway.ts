import type { RetrievalChunkRepository } from "@avora/db/repositories/chunks";

import type {
  SummaryCandidate,
  SummaryInvocationPort,
  SummaryQualityTier,
} from "../invocation/index.js";
import { summaryGenerationTask } from "../invocation/index.js";
import {
  createSummaryInsufficiencyResponse,
  createSummaryRefusalResponse,
} from "./GeneratedSummary.js";
import type {
  GeneratedSummary,
  SummaryGatewayResponse,
} from "./GeneratedSummary.js";
import {
  createGroundedSummaryContextEnvelope,
} from "./GroundedSummaryContextEnvelope.js";
import type {
  GroundedSummaryContextEnvelope,
} from "./GroundedSummaryContextEnvelope.js";
import { validateGeneratedSummary } from "./SummaryValidation.js";
import type { SummaryQuery } from "./SummaryQuery.js";
import { SummaryGatewayError } from "./SummaryGatewayError.js";

export type SummaryGatewayPort = Readonly<{
  generateResourceSummary: (query: SummaryQuery) => Promise<SummaryGatewayResponse>;
}>;

export type CreateSummaryGatewayInput = Readonly<{
  chunkRetrieval: Pick<RetrievalChunkRepository, "listRetrievalChunksByResource">;
  summaryInvocation: SummaryInvocationPort;
  defaults: SummaryGatewayDefaults;
}>;

export type SummaryGatewayDefaults = Readonly<{
  minChunkCount: number;
  qualityTier: SummaryQualityTier;
}>;

export function createSummaryGateway(
  input: CreateSummaryGatewayInput,
): SummaryGatewayPort {
  assertValidSummaryGatewayDefaults(input.defaults);

  const resolveContextOrInsufficiency = async (
    query: SummaryQuery,
  ): Promise<
    | { kind: "context"; context: GroundedSummaryContextEnvelope }
    | { kind: "insufficiency"; response: SummaryGatewayResponse }
  > => {
    const chunks = await input.chunkRetrieval.listRetrievalChunksByResource({
      studentId: query.studentId,
      resourceId: query.resourceId,
      status: "ready",
    });

    if (chunks.length < input.defaults.minChunkCount) {
      return {
        kind: "insufficiency",
        response: createSummaryInsufficiencyResponse({
          query,
          reason: "no_indexed_chunks",
        }),
      };
    }

    const context = createGroundedSummaryContextEnvelope({ query, chunks });

    if (context.evidence.length === 0 || context.allowedChunkIds.length === 0) {
      return {
        kind: "insufficiency",
        response: createSummaryInsufficiencyResponse({
          query,
          reason: "grounded_context_empty",
        }),
      };
    }

    return { kind: "context", context };
  };

  const validateCandidateToFinalResponse = (
    candidate: SummaryCandidate,
    query: SummaryQuery,
    context: GroundedSummaryContextEnvelope,
  ): SummaryGatewayResponse => {
    const generatedSummary: GeneratedSummary = {
      status: "generated",
      query,
      context,
      body: candidate.body,
      citations: candidate.citations,
      modelVersion: candidate.modelVersion,
      createdAt: candidate.createdAt,
    };

    const validation = validateGeneratedSummary(generatedSummary);

    if (!validation.valid) {
      return createSummaryRefusalResponse({
        query,
        reason: "citation_validation_failed",
        message:
          "I could not produce a grounded summary with valid citations from this resource.",
      });
    }

    return generatedSummary;
  };

  const invokeSummaryGenerationSafely = async (
    query: SummaryQuery,
    context: GroundedSummaryContextEnvelope,
  ): Promise<SummaryCandidate> => {
    try {
      const result = await input.summaryInvocation.invokeSummaryGeneration({
        task: summaryGenerationTask,
        qualityTier: input.defaults.qualityTier,
        query,
        context,
      });

      return result.candidate;
    } catch (error) {
      throw new SummaryGatewayError(
        "summary_gateway_provider_invocation_failed",
        "Summary Gateway provider invocation failed.",
        { cause: error },
      );
    }
  };

  return {
    generateResourceSummary: async (
      query: SummaryQuery,
    ): Promise<SummaryGatewayResponse> => {
      const resolved = await resolveContextOrInsufficiency(query);

      if (resolved.kind === "insufficiency") {
        return resolved.response;
      }

      let candidate: SummaryCandidate;

      try {
        candidate = await invokeSummaryGenerationSafely(query, resolved.context);
      } catch {
        return createSummaryRefusalResponse({
          query,
          reason: "invocation_failed",
          message: "I could not produce a grounded summary from this resource right now.",
        });
      }

      return validateCandidateToFinalResponse(candidate, query, resolved.context);
    },
  };
}

function assertValidSummaryGatewayDefaults(
  defaults: SummaryGatewayDefaults,
): void {
  if (
    !Number.isSafeInteger(defaults.minChunkCount) ||
    defaults.minChunkCount <= 0
  ) {
    throw new SummaryGatewayError(
      "summary_gateway_provider_invocation_failed",
      "Summary Gateway minChunkCount default must be a positive safe integer.",
    );
  }
}
