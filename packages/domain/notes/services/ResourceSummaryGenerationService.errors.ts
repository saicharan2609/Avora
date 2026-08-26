export type ResourceSummaryGenerationServiceErrorCode =
  | "resource_summary_generation_empty_body"
  | "resource_summary_generation_empty_heading"
  | "resource_summary_generation_missing_citation"
  | "resource_summary_generation_missing_model_version";

export class ResourceSummaryGenerationServiceError extends Error {
  public readonly code: ResourceSummaryGenerationServiceErrorCode;

  public constructor(
    code: ResourceSummaryGenerationServiceErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ResourceSummaryGenerationServiceError";
    this.code = code;
  }
}
