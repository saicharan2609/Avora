export type ResourceSummaryWorkerErrorCode =
  | "resource_summary_worker_generation_refused"
  | "resource_summary_worker_persistence_failed";

export class ResourceSummaryWorkerError extends Error {
  public readonly code: ResourceSummaryWorkerErrorCode;

  public constructor(
    code: ResourceSummaryWorkerErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ResourceSummaryWorkerError";
    this.code = code;
  }
}
