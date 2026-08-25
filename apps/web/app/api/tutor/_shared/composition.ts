import type { TutorAnswerInvocationPort } from "@avora/ai/gateway/invocation";
import {
  TutorGatewayError,
  createTutorGateway,
  createTutorHybridRetrievalSearch,
  createTutorRetrievalSearch,
} from "@avora/ai/gateway/tutor";
import type {
  RetrievalSearchPort,
  TutorGatewayPort,
} from "@avora/ai/gateway/tutor";
import {
  createGeminiTutorAnswerAdapter,
  createGoogleGenAIEmbeddingClient,
  createGoogleGenAITutorAnswerClient,
  geminiEmbeddingModelId,
  geminiEmbeddingOutputDimensions,
  geminiEmbeddingStrategyVersion,
} from "@avora/ai/adapters/google";
import { createRetrievalChunkRepository } from "@avora/db/repositories/chunks";


import type {
  AuthenticatedTutorApiStudent,
  WebTutorApiEnvironment,
} from "./auth";

export type CreateWebTutorApiCompositionInput = Readonly<{
  environment: WebTutorApiEnvironment;
  authenticatedStudent: AuthenticatedTutorApiStudent;
  retrievalSearchOverride?: RetrievalSearchPort;
  tutorAnswerInvocationOverride?: TutorAnswerInvocationPort;
}>;

export type WebTutorApiComposition = Readonly<{
  tutorGateway: TutorGatewayPort;
}>;

export function createWebTutorApiComposition(
  input: CreateWebTutorApiCompositionInput,
): WebTutorApiComposition {
  const retrievalChunkRepository = createRetrievalChunkRepository({
    client: input.authenticatedStudent.client,
  });

  const retrievalSearch =
    input.retrievalSearchOverride ??
    (input.environment.geminiApiKey !== undefined
      ? createProductionHybridRetrievalSearch({
          geminiApiKey: input.environment.geminiApiKey,
          retrievalChunkRepository,
        })
      : createTutorRetrievalSearch({
          retrievalChunkRepository,
        }));

  const tutorAnswerInvocation =
    input.tutorAnswerInvocationOverride ??
    (input.environment.geminiApiKey !== undefined
      ? createProductionTutorAnswerAdapter({
          geminiApiKey: input.environment.geminiApiKey,
        })
      : createUnavailableTutorAnswerInvocationPort());

  return {
    tutorGateway: createTutorGateway({
      retrievalSearch,
      tutorAnswerInvocation,
      defaults: {
        maxChunks: readPositiveIntegerEnvironmentValue(
          "AVORA_TUTOR_MAX_CHUNKS",
          8,
        ),
        minChunkCount: readPositiveIntegerEnvironmentValue(
          "AVORA_TUTOR_MIN_CHUNK_COUNT",
          1,
        ),
        qualityTier: "standard",
      },
    }),
  };
}

function createProductionHybridRetrievalSearch(params: {
  geminiApiKey: string;
  retrievalChunkRepository: ReturnType<typeof createRetrievalChunkRepository>;
}): RetrievalSearchPort {
  const embeddingClient = createGoogleGenAIEmbeddingClient({
    apiKey: params.geminiApiKey,
  });

  return createTutorHybridRetrievalSearch({
    retrievalChunkRepository: params.retrievalChunkRepository,
    embedQueryText: async ({ queryText }) => {
      const result = await embeddingClient.embedContent({
        model: geminiEmbeddingModelId,
        contents: [queryText],
        outputDimensionality: geminiEmbeddingOutputDimensions,
      });
      const embedding = result.embeddings[0]?.values;
      if (!embedding || embedding.length !== geminiEmbeddingOutputDimensions) {
        throw new Error("Failed to generate query embedding.");
      }
      return embedding;
    },
    embeddingStrategyVersion: geminiEmbeddingStrategyVersion,
  });
}


function createProductionTutorAnswerAdapter(params: {
  geminiApiKey: string;
}): TutorAnswerInvocationPort {
  const tutorAnswerClient = createGoogleGenAITutorAnswerClient({
    apiKey: params.geminiApiKey,
  });

  return createGeminiTutorAnswerAdapter({
    client: tutorAnswerClient,
    invocationGateState: "enabled",
    taskBudgets: {
      standard: { maxOutputTokens: 4096 },
      high: { maxOutputTokens: 8192 },
    },
  });
}

export function readWebTutorApiEnvironment(): WebTutorApiEnvironment {
  return {
    supabaseUrl: readRequiredEnvironmentValue("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: readRequiredEnvironmentValue(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ),
    geminiApiKey: process.env["GEMINI_API_KEY"],
  };
}

function createUnavailableTutorAnswerInvocationPort(): TutorAnswerInvocationPort {
  return {
    invokeTutorAnswer: async () => {
      throw new TutorGatewayError(
        "tutor_gateway_provider_invocation_failed",
        "Tutor answer provider invocation is not configured for the web runtime.",
      );
    },
  };
}

function readRequiredEnvironmentValue(name: string): string {
  const value = process.env[name];

  if (value === undefined || value.length === 0) {
    throw new Error(
      `Missing required web tutor api environment variable: ${name}`,
    );
  }

  return value;
}

function readPositiveIntegerEnvironmentValue(
  name: string,
  fallback: number,
): number {
  const rawValue = process.env[name];

  if (rawValue === undefined || rawValue.length === 0) {
    return fallback;
  }

  const value = Number.parseInt(rawValue, 10);

  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`Invalid web tutor api environment variable: ${name}`);
  }

  return value;
}
