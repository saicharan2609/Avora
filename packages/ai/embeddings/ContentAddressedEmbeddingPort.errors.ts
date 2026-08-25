export type ContentAddressedEmbeddingPortErrorCode =
  | "content_addressed_embedding_port_cache_read_failed"
  | "content_addressed_embedding_port_cache_write_failed"
  | "content_addressed_embedding_port_missing_embedding";

export class ContentAddressedEmbeddingPortError extends Error {
  public readonly code: ContentAddressedEmbeddingPortErrorCode;

  public constructor(
    code: ContentAddressedEmbeddingPortErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ContentAddressedEmbeddingPortError";
    this.code = code;
  }
}
