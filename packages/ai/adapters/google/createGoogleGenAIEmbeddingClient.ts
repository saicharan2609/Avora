import { GoogleGenAI } from "@google/genai";

import type {
  GeminiEmbedContentInput,
  GeminiEmbedContentResult,
  GeminiEmbeddingClient,
} from "./GeminiEmbeddingClient.js";

export type CreateGoogleGenAIEmbeddingClientInput = Readonly<{
  apiKey: string;
}>;

export function createGoogleGenAIEmbeddingClient(
  input: CreateGoogleGenAIEmbeddingClientInput,
): GeminiEmbeddingClient {
  const genAI = new GoogleGenAI({ apiKey: input.apiKey });

  return {
    embedContent: async (
      embedInput: GeminiEmbedContentInput,
    ): Promise<GeminiEmbedContentResult> => {
      const response = await genAI.models.embedContent({
        model: embedInput.model,
        contents: [...embedInput.contents],
        config: {
          outputDimensionality: embedInput.outputDimensionality,
        },
      });

      return {
        embeddings: (response.embeddings ?? []).map((embedding) => ({
          values: embedding.values,
        })),
      };
    },
  };
}
