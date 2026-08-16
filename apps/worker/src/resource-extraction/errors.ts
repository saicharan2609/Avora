export type ResourceExtractionWorkerHandlerErrorCode =
  | "resource_extraction_worker_invalid_job"
  | "resource_extraction_worker_checkpoint_failed"
  | "resource_extraction_worker_lifecycle_failed"
  | "resource_extraction_worker_persistence_failed"
  | "resource_extraction_worker_unexpected_failure";

export class ResourceExtractionWorkerHandlerError extends Error {
  public readonly code: ResourceExtractionWorkerHandlerErrorCode;

  public constructor(
    code: ResourceExtractionWorkerHandlerErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ResourceExtractionWorkerHandlerError";
    this.code = code;
  }
}