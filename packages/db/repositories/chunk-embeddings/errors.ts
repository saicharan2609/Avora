export type ChunkEmbeddingsRepositoryErrorCode =
  | "chunk_embeddings_repository_invalid_embedding"
  | "chunk_embeddings_repository_invalid_embedding_shape"
  | "chunk_embeddings_repository_write_failed"
  | "chunk_embeddings_repository_read_failed";

export class ChunkEmbeddingsRepositoryError extends Error {
  public readonly code: ChunkEmbeddingsRepositoryErrorCode;

  public constructor(code: ChunkEmbeddingsRepositoryErrorCode, message: string) {
    super(message);
    this.name = "ChunkEmbeddingsRepositoryError";
    this.code = code;
  }
}
