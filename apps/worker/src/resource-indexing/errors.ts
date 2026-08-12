export type ResourceIndexingWorkerErrorCode =
  | "resource_indexing_worker_embedding_failed"
  | "resource_indexing_worker_inconsistent_embedding_result"
  | "resource_indexing_worker_persistence_failed";

export class ResourceIndexingWorkerError extends Error {
  public readonly code: ResourceIndexingWorkerErrorCode;

  public constructor(
    code: ResourceIndexingWorkerErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ResourceIndexingWorkerError";
    this.code = code;
  }
}