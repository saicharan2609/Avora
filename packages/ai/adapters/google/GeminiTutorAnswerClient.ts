export type GeminiTutorAnswerGenerateContentInput = Readonly<{
  model: string;
  systemInstructionText: string;
  userContentText: string;
  temperature: number;
  maxOutputTokens: number;
  responseMimeType: "application/json";
}>;

export type GeminiTutorAnswerGenerateContentResult = Readonly<{
  text: string | undefined;
}>;

export type GeminiTutorAnswerStreamChunk = Readonly<{
  text: string | undefined;
}>;

export type GeminiTutorAnswerClient = Readonly<{
  generateContent: (
    input: GeminiTutorAnswerGenerateContentInput,
  ) => Promise<GeminiTutorAnswerGenerateContentResult>;
  generateContentStream?: (
    input: GeminiTutorAnswerGenerateContentInput,
  ) => Promise<AsyncIterable<GeminiTutorAnswerStreamChunk>>;
}>;
