export type VisionExtractionAdapterErrorCode =
  | "vision_extraction_unsupported_mime"
  | "vision_extraction_empty_response"
  | "vision_extraction_client_failed";

export class VisionExtractionAdapterError extends Error {
  public readonly code: VisionExtractionAdapterErrorCode;

  public constructor(code: VisionExtractionAdapterErrorCode, message: string) {
    super(message);
    this.name = "VisionExtractionAdapterError";
    this.code = code;
  }
}
