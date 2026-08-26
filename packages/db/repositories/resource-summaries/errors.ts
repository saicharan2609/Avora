export type ResourceSummariesRepositoryErrorCode =
  | "resource_summaries_repository_invalid_input"
  | "resource_summaries_repository_insert_failed"
  | "resource_summaries_repository_citation_persistence_failed"
  | "resource_summaries_repository_read_failed";

export class ResourceSummariesRepositoryError extends Error {
  public readonly code: ResourceSummariesRepositoryErrorCode;

  public constructor(code: ResourceSummariesRepositoryErrorCode, message: string) {
    super(message);
    this.name = "ResourceSummariesRepositoryError";
    this.code = code;
  }
}
