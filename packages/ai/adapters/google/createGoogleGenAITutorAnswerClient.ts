import { GoogleGenAI } from "@google/genai";

import type {
  GeminiTutorAnswerClient,
  GeminiTutorAnswerGenerateContentInput,
  GeminiTutorAnswerGenerateContentResult,
} from "./GeminiTutorAnswerClient.js";

export type CreateGoogleGenAITutorAnswerClientInput = Readonly<{
  apiKey: string;
}>;

export function createGoogleGenAITutorAnswerClient(
  input: CreateGoogleGenAITutorAnswerClientInput,
): GeminiTutorAnswerClient {
  const genAI = new GoogleGenAI({ apiKey: input.apiKey });

  return {
    generateContent: async (
      request: GeminiTutorAnswerGenerateContentInput,
    ): Promise<GeminiTutorAnswerGenerateContentResult> => {
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
