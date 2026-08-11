export type ResourceChunkingWorkerErrorCode =
  | "resource_chunking_worker_document_not_found"
  | "resource_chunking_worker_document_not_chunkable"
  | "resource_chunking_worker_no_blocks"
  | "resource_chunking_worker_persistence_failed";

export class ResourceChunkingWorkerError extends Error {
  public readonly code: ResourceChunkingWorkerErrorCode;

  public constructor(
    code: ResourceChunkingWorkerErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ResourceChunkingWorkerError";
    this.code = code;
  }
}