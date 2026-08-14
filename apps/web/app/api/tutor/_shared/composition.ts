import type {
  TutorAnswerInvocationPort,
} from "@avora/ai/gateway/invocation";
import {
  TutorGatewayError,
  createTutorGateway,
} from "@avora/ai/gateway/tutor";
import type {
  TutorGatewayPort,
} from "@avora/ai/gateway/tutor";
import { createRetrievalChunkRepository } from "@avora/db/repositories/chunks";
import { createScopedRetrievalSearch } from "@avora/retrieval/search";

import type {
  AuthenticatedTutorApiStudent,
  WebTutorApiEnvironment,
} from "./auth";

export type CreateWebTutorApiCompositionInput = Readonly<{
  environment: WebTutorApiEnvironment;
  authenticatedStudent: AuthenticatedTutorApiStudent;
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

  const retrievalSearch = createScopedRetrievalSearch({
    retrievalChunkRepository,
  });

  return {
    tutorGateway: createTutorGateway({
      retrievalSearch,
      tutorAnswerInvocation: createUnavailableTutorAnswerInvocationPort(),
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

export function readWebTutorApiEnvironment(): WebTutorApiEnvironment {
  return {
    supabaseUrl: readRequiredEnvironmentValue("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: readRequiredEnvironmentValue("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
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
    throw new Error(`Missing required web tutor api environment variable: ${name}`);
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