export type EmbeddingStrategyVersion = string & {
  readonly __brand: "EmbeddingStrategyVersion";
};

export type EmbeddingInputId = string & {
  readonly __brand: "EmbeddingInputId";
};

export type EmbeddingVector = readonly number[];

export type EmbeddingTextInput = Readonly<{
  id: EmbeddingInputId;
  text: string;
  contentHash: string;
  metadata: Readonly<{
    studentId: string;
    resourceId: string;
    chunkId: string;
  }>;
}>;

export type EmbedTextsInput = Readonly<{
  strategyVersion: EmbeddingStrategyVersion;
  inputs: readonly EmbeddingTextInput[];
}>;

export type EmbeddedText = Readonly<{
  id: EmbeddingInputId;
  vector: EmbeddingVector;
  dimensions: number;
  contentHash: string;
  embeddingStrategyVersion: EmbeddingStrategyVersion;
}>;

export type EmbedTextsResult = Readonly<{
  strategyVersion: EmbeddingStrategyVersion;
  embeddings: readonly EmbeddedText[];
}>;

export type EmbeddingPort = Readonly<{
  embedTexts: (input: EmbedTextsInput) => Promise<EmbedTextsResult>;
}>;