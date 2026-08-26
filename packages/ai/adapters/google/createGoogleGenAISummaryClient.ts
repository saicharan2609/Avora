import { GoogleGenAI } from "@google/genai";

import type {
  GeminiSummaryClient,
  GeminiSummaryGenerateContentInput,
  GeminiSummaryGenerateContentResult,
} from "./GeminiSummaryClient.js";

export type CreateGoogleGenAISummaryClientInput = Readonly<{
  apiKey: string;
}>;

export function createGoogleGenAISummaryClient(
  input: CreateGoogleGenAISummaryClientInput,
): GeminiSummaryClient {
  const genAI = new GoogleGenAI({ apiKey: input.apiKey });

  return {
    generateContent: async (
      request: GeminiSummaryGenerateContentInput,
    ): Promise<GeminiSummaryGenerateContentResult> => {
      const response = await genAI.models.generateContent({
        model: request.model,
        contents: request.userContentText,
        config: {
          systemInstruction: request.systemInstructionText,
          temperature: request.temperature,
          maxOutputTokens: request.maxOutputTokens,
          responseMimeType: request.responseMimeType,
        },
      });

      return {
        text: response.text,
      };
    },
  };
}
