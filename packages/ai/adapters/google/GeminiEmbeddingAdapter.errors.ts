export type GeminiEmbeddingAdapterErrorCode =
  | "gemini_embedding_adapter_invocation_not_authorized"
  | "gemini_embedding_adapter_empty_input"
  | "gemini_embedding_adapter_unsupported_strategy_version"
  | "gemini_embedding_adapter_provider_call_failed"
  | "gemini_embedding_adapter_result_count_mismatch"
  | "gemini_embedding_adapter_missing_vector";

export class GeminiEmbeddingAdapterError extends Error {
  public readonly code: GeminiEmbeddingAdapterErrorCode;

  public constructor(
    code: GeminiEmbeddingAdapterErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "GeminiEmbeddingAdapterError";
    this.code = code;
  }
}
