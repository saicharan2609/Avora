export type PdfExtractionAdapterErrorCode =
  | "pdf_extraction_unsupported_mime"
  | "pdf_extraction_corrupt_payload"
  | "pdf_extraction_empty_document"
  | "pdf_extraction_failed";

export class PdfExtractionAdapterError extends Error {
  public readonly code: PdfExtractionAdapterErrorCode;

  public constructor(code: PdfExtractionAdapterErrorCode, message: string) {
    super(message);
    this.name = "PdfExtractionAdapterError";
    this.code = code;
  }
}
