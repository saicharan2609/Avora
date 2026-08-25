export type EmbeddingCacheRepositoryErrorCode =
  | "embedding_cache_repository_invalid_entry"
  | "embedding_cache_repository_invalid_embedding_shape"
  | "embedding_cache_repository_read_failed"
  | "embedding_cache_repository_write_failed";

export class EmbeddingCacheRepositoryError extends Error {
  public readonly code: EmbeddingCacheRepositoryErrorCode;

  public constructor(code: EmbeddingCacheRepositoryErrorCode, message: string) {
    super(message);
    this.name = "EmbeddingCacheRepositoryError";
    this.code = code;
  }
}
