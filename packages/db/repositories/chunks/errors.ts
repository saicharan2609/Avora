export type RetrievalChunkRepositoryErrorCode =
  | "retrieval_chunk_repository_invalid_chunk"
  | "retrieval_chunk_repository_invalid_locator"
  | "retrieval_chunk_repository_create_failed"
  | "retrieval_chunk_repository_read_failed"
  | "retrieval_chunk_repository_invalid_hybrid_search_input"
  | "retrieval_chunk_repository_hybrid_search_failed"
  | "retrieval_chunk_repository_hybrid_search_ownership_violation";

export class RetrievalChunkRepositoryError extends Error {
  public readonly code: RetrievalChunkRepositoryErrorCode;

  public constructor(code: RetrievalChunkRepositoryErrorCode, message: string) {
    super(message);
    this.name = "RetrievalChunkRepositoryError";
    this.code = code;
  }
}