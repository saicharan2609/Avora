export type ResourceChunkerErrorCode =
  | "resource_chunker_invalid_input"
  | "resource_chunker_inconsistent_blocks"
  | "resource_chunker_empty_output";

export class ResourceChunkerError extends Error {
  public readonly code: ResourceChunkerErrorCode;

  public constructor(code: ResourceChunkerErrorCode, message: string) {
    super(message);
    this.name = "ResourceChunkerError";
    this.code = code;
  }
}