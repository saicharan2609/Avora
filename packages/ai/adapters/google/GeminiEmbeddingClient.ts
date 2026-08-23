export type GeminiEmbedContentInput = Readonly<{
  model: string;
  contents: readonly string[];
  outputDimensionality: number;
}>;

export type GeminiEmbedContentResultEntry = Readonly<{
  values: readonly number[] | undefined;
}>;

export type GeminiEmbedContentResult = Readonly<{
  embeddings: readonly GeminiEmbedContentResultEntry[];
}>;

export type GeminiEmbeddingClient = Readonly<{
  embedContent: (
    input: GeminiEmbedContentInput,
  ) => Promise<GeminiEmbedContentResult>;
}>;
