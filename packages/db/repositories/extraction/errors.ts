export type ResourceExtractionRepositoryErrorCode =
  | "resource_extraction_repository_invalid_document"
  | "resource_extraction_repository_invalid_block"
  | "resource_extraction_repository_invalid_locator"
  | "resource_extraction_repository_create_document_failed"
  | "resource_extraction_repository_create_blocks_failed"
  | "resource_extraction_repository_read_documents_failed"
  | "resource_extraction_repository_read_blocks_failed"
  | "resource_extraction_repository_invalid_tree";

export class ResourceExtractionRepositoryError extends Error {
  public readonly code: ResourceExtractionRepositoryErrorCode;

  public constructor(code: ResourceExtractionRepositoryErrorCode, message: string) {
    super(message);
    this.name = "ResourceExtractionRepositoryError";
    this.code = code;
  }
}