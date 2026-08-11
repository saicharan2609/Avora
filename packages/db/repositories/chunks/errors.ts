export type RetrievalChunkRepositoryErrorCode =
  | "retrieval_chunk_repository_invalid_chunk"
  | "retrieval_chunk_repository_invalid_locator"
  | "retrieval_chunk_repository_create_failed"
  | "retrieval_chunk_repository_read_failed";

export class RetrievalChunkRepositoryError extends Error {
  public readonly code: RetrievalChunkRepositoryErrorCode;

  public constructor(code: RetrievalChunkRepositoryErrorCode, message: string) {
    super(message);
    this.name = "RetrievalChunkRepositoryError";
    this.code = code;
  }
}