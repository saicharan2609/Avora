import type {
  ExtractionPort,
  ResourceExtractionFailure,
  ResourceExtractionFailureId,
  ResourceExtractionRequest,
  ResourceExtractionResult,
} from "@avora/domain/resources";

export type CreateCompositeResourceExtractionAdapterInput = Readonly<{
  pdfAdapter: ExtractionPort;
  visionAdapter?: ExtractionPort;
}>;

const PDF_MIME_TYPES = new Set(["application/pdf"]);

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
]);

export function createCompositeResourceExtractionAdapter(
  input: CreateCompositeResourceExtractionAdapterInput,
): ExtractionPort {
  return {
    extractResourceContent: async (
      request: ResourceExtractionRequest,
    ): Promise<ResourceExtractionResult> => {
      const mime = request.declaredMimeType.toLowerCase().trim();

      // 1. PDF Documents
      if (PDF_MIME_TYPES.has(mime)) {
        const pdfResult =
          await input.pdfAdapter.extractResourceContent(request);

        // If digital PDF extraction failed due to empty text (e.g. scanned image PDF)
        // and we have a vision adapter, attempt fallback to vision OCR
        if (
          pdfResult.outcome === "failed" &&
          pdfResult.failure.code === "empty_extraction" &&
          input.visionAdapter !== undefined
        ) {
          return input.visionAdapter.extractResourceContent(request);
        }

        return pdfResult;
      }

      // 2. Scanned Images & Photos
      if (IMAGE_MIME_TYPES.has(mime)) {
        if (input.visionAdapter === undefined) {
          const failure: ResourceExtractionFailure = {
            failureId:
              `${request.extractionDocumentId}-fail-no-vision` as ResourceExtractionFailureId,
            code: "extractor_failed",
            message:
              "Vision extraction adapter is not configured for image resources",
          };

          return {
            outcome: "failed",
            failure,
          };
        }

        return input.visionAdapter.extractResourceContent(request);
      }

      // 3. Unsupported MIME Types (Fail-closed)
      const failure: ResourceExtractionFailure = {
        failureId:
          `${request.extractionDocumentId}-fail-unsupported-mime` as ResourceExtractionFailureId,
        code: "unsupported_mime_type",
        message: `MIME type '${request.declaredMimeType}' is not supported for text/vision extraction`,
      };

      return {
        outcome: "failed",
        failure,
      };
    },
  };
}
