export type ResourceClassificationWorkerErrorCode =
  | "resource_classification_worker_resource_not_found"
  | "resource_classification_worker_candidate_persistence_failed";

export class ResourceClassificationWorkerError extends Error {
  public readonly code: ResourceClassificationWorkerErrorCode;

  public constructor(
    code: ResourceClassificationWorkerErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ResourceClassificationWorkerError";
    this.code = code;
  }
}
