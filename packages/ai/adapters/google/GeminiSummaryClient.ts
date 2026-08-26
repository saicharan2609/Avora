export type GeminiSummaryGenerateContentInput = Readonly<{
  model: string;
  systemInstructionText: string;
  userContentText: string;
  temperature: number;
  maxOutputTokens: number;
  responseMimeType: "application/json";
}>;

export type GeminiSummaryGenerateContentResult = Readonly<{
  text: string | undefined;
}>;

export type GeminiSummaryClient = Readonly<{
  generateContent: (
    input: GeminiSummaryGenerateContentInput,
  ) => Promise<GeminiSummaryGenerateContentResult>;
}>;
