export type ResourcesRepositoryErrorCode =
  | "resources_repository_create_failed"
  | "resources_repository_complete_failed"
  | "resources_repository_read_failed"
  | "resources_repository_missing_completed_resource"
  | "resources_repository_invalid_storage_path"
  | "resources_repository_invalid_insert_result"
  | "resources_repository_invalid_update_result"
  | "resources_repository_invalid_read_result";

export class ResourcesRepositoryError extends Error {
  public readonly code: ResourcesRepositoryErrorCode;

  public constructor(code: ResourcesRepositoryErrorCode, message: string) {
    super(message);
    this.name = "ResourcesRepositoryError";
    this.code = code;
  }
}