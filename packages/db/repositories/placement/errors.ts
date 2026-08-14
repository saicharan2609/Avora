export type ResourcePlacementRepositoryErrorCode =
  | "resource_placement_repository_create_failed"
  | "resource_placement_repository_update_failed"
  | "resource_placement_repository_read_failed"
  | "resource_placement_repository_invalid_input"
  | "resource_placement_repository_invalid_row";

export class ResourcePlacementRepositoryError extends Error {
  public readonly code: ResourcePlacementRepositoryErrorCode;

  public constructor(
    code: ResourcePlacementRepositoryErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ResourcePlacementRepositoryError";
    this.code = code;
  }
}