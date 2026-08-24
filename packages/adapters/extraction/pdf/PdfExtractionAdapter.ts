import type {
  ExtractedResourceContent,
  ExtractionProvenance,
  ExtractionPort,
  ResourceExtractionDocument,
  ResourceExtractionFailure,
  ResourceExtractionFailureId,
  ResourceExtractionProvenanceId,
  ResourceExtractionRequest,
  ResourceExtractionResult,
} from "@avora/domain/resources";
import type { IsoDateTimeString } from "@avora/core/time";

import {
  parsePdfStructure,
  type RawPdfPageInput,
} from "./PdfStructureParser.js";

export type PdfPageTextReader = (
  request: ResourceExtractionRequest,
) => Promise<readonly RawPdfPageInput[]>;

export type CreatePdfExtractionAdapterInput = Readonly<{
  pageReader?: PdfPageTextReader;
}>;

export function createPdfExtractionAdapter(
  input: CreatePdfExtractionAdapterInput = {},
): ExtractionPort {
  const pageReader: PdfPageTextReader = input.pageReader ?? (async () => []);

  return {
    extractResourceContent: async (
      request: ResourceExtractionRequest,
    ): Promise<ResourceExtractionResult> => {
      // 1. Validate MIME type
      if (request.declaredMimeType !== "application/pdf") {
        const failure: ResourceExtractionFailure = {
          failureId:
            `${request.extractionDocumentId}-fail-mime` as ResourceExtractionFailureId,
          code: "unsupported_mime_type",
          message: `PdfExtractionAdapter expects application/pdf but received ${request.declaredMimeType}`,
        };

        return {
          outcome: "failed",
          failure,
        };
      }

      try {
        // 2. Read raw pages from PDF
        const rawPages = await pageReader(request);

        // 3. Handle empty document
        if (rawPages.length === 0) {
          const failure: ResourceExtractionFailure = {
            failureId:
              `${request.extractionDocumentId}-fail-empty` as ResourceExtractionFailureId,
            code: "empty_extraction",
            message: "PDF extraction yielded 0 pages or text was unreadable",
          };

          return {
            outcome: "failed",
            failure,
          };
        }

        const now = new Date().toISOString() as IsoDateTimeString;

        const provenance: ExtractionProvenance = {
          provenanceId:
            `${request.extractionDocumentId}-prov-1` as ResourceExtractionProvenanceId,
          source: "document_text",
          strategyVersion: request.extractionStrategyVersion,
          extractedAt: now,
          notes: "avora.pdf.parser.v1",
        };

        // 4. Parse document structure (headings, lists, tables, code, paragraphs)
        const parsed = parsePdfStructure({
          extractionDocumentId: request.extractionDocumentId,
          rawPages,
          provenance,
          strategyVersion: request.extractionStrategyVersion,
        });

        const totalCharCount = parsed.pages.reduce(
          (sum, p) => sum + p.text.length,
          0,
        );

        if (totalCharCount === 0 || parsed.blocks.length === 0) {
          const failure: ResourceExtractionFailure = {
            failureId:
              `${request.extractionDocumentId}-fail-empty` as ResourceExtractionFailureId,
            code: "empty_extraction",
            message:
              "PDF contains pages but zero extractable text content blocks",
          };

          return {
            outcome: "failed",
            failure,
          };
        }

        const document: ResourceExtractionDocument = {
          extractionDocumentId: request.extractionDocumentId,
          studentId: request.studentId,
          resourceId: request.resourceId,
          status: "extracted",
          extractionStrategyVersion: request.extractionStrategyVersion,
          chunkingStrategyVersion: request.chunkingStrategyVersion,
          extractedAt: now,
          blocks: parsed.blocks,
        };

        const content: ExtractedResourceContent = {
          extractionDocumentId: request.extractionDocumentId,
          studentId: request.studentId,
          resourceId: request.resourceId,
          extractionStrategyVersion: request.extractionStrategyVersion,
          chunkingStrategyVersion: request.chunkingStrategyVersion,
          pages: parsed.pages,
          blocks: parsed.blocks,
          provenance,
          extractedAt: now,
        };

        return {
          outcome: "extracted",
          document,
          content,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unknown PDF extraction failure";

        const failure: ResourceExtractionFailure = {
          failureId:
            `${request.extractionDocumentId}-fail-err` as ResourceExtractionFailureId,
          code: "extractor_failed",
          message: `PDF extraction error: ${errorMessage}`,
        };

        return {
          outcome: "failed",
          failure,
        };
      }
    },
  };
}
