export type RetrievalSearchErrorCode =
  | "retrieval_search_invalid_input"
  | "retrieval_search_repository_failed";

export class RetrievalSearchError extends Error {
  public readonly code: RetrievalSearchErrorCode;

  public constructor(
    code: RetrievalSearchErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "RetrievalSearchError";
    this.code = code;
  }
}