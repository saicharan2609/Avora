import type {
  ExtractedPage,
  ExtractedResourceContent,
  ExtractionPort,
  ExtractionProvenance,
  ResourceExtractedContentBlock,
  ResourceExtractedContentBlockId,
  ResourceExtractedPageId,
  ResourceExtractionDocument,
  ResourceExtractionFailure,
  ResourceExtractionFailureId,
  ResourceExtractionProvenanceId,
  ResourceExtractionRequest,
  ResourceExtractionResult,
  ResourceSourceLocator,
} from "@avora/domain/resources";
import type { IsoDateTimeString } from "@avora/core/time";

import { sanitizeExtractedText } from "../sanitization/ResourceTextSanitizer.js";
import type {
  VisionExtractedBlock,
  VisionExtractionClient,
  VisionExtractionClientInput,
} from "./VisionExtractionClient.js";

export type ImageBytesLoader = (
  request: ResourceExtractionRequest,
) => Promise<string | undefined>;

export type CreateVisionExtractionAdapterInput = Readonly<{
  client: VisionExtractionClient;
  imageLoader?: ImageBytesLoader;
  model?: string;
}>;

const SUPPORTED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
]);

export function createVisionExtractionAdapter(
  input: CreateVisionExtractionAdapterInput,
): ExtractionPort {
  return {
    extractResourceContent: async (
      request: ResourceExtractionRequest,
    ): Promise<ResourceExtractionResult> => {
      // 1. Validate MIME type
      if (!SUPPORTED_IMAGE_MIMES.has(request.declaredMimeType.toLowerCase())) {
        const failure: ResourceExtractionFailure = {
          failureId:
            `${request.extractionDocumentId}-fail-mime` as ResourceExtractionFailureId,
          code: "unsupported_mime_type",
          message: `VisionExtractionAdapter expects image MIME type (jpeg/png/webp/heic) but received ${request.declaredMimeType}`,
        };

        return {
          outcome: "failed",
          failure,
        };
      }

      try {
        // 2. Load image payload if loader provided
        const imageBytesBase64 = input.imageLoader
          ? await input.imageLoader(request)
          : undefined;

        const clientInput: VisionExtractionClientInput = {
          model: input.model,
          mimeType: request.declaredMimeType,
          imageBytesBase64,
        };

        // 3. Invoke Vision Client
        const response = await input.client.extractVisionContent(clientInput);

        if (response.blocks.length === 0) {
          const failure: ResourceExtractionFailure = {
            failureId:
              `${request.extractionDocumentId}-fail-empty` as ResourceExtractionFailureId,
            code: "empty_extraction",
            message:
              "Vision extraction returned 0 content blocks from the scanned image",
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
          source: "ocr",
          strategyVersion: request.extractionStrategyVersion,
          extractedAt: now,
          notes: "google.gemini.vision",
        };

        // 4. Map blocks and group into pages
        const { blocks, pages } = buildVisionBlocksAndPages({
          extractionDocumentId: request.extractionDocumentId,
          rawBlocks: response.blocks,
          provenance,
        });

        if (blocks.length === 0) {
          const failure: ResourceExtractionFailure = {
            failureId:
              `${request.extractionDocumentId}-fail-empty` as ResourceExtractionFailureId,
            code: "empty_extraction",
            message:
              "All extracted vision blocks were empty after sanitization",
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
          blocks,
        };

        const content: ExtractedResourceContent = {
          extractionDocumentId: request.extractionDocumentId,
          studentId: request.studentId,
          resourceId: request.resourceId,
          extractionStrategyVersion: request.extractionStrategyVersion,
          chunkingStrategyVersion: request.chunkingStrategyVersion,
          pages,
          blocks,
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
            : "Unknown vision extraction error";

        const failure: ResourceExtractionFailure = {
          failureId:
            `${request.extractionDocumentId}-fail-err` as ResourceExtractionFailureId,
          code: "extractor_failed",
          message: `Vision extraction failed: ${errorMessage}`,
        };

        return {
          outcome: "failed",
          failure,
        };
      }
    },
  };
}

function buildVisionBlocksAndPages(input: {
  extractionDocumentId: string;
  rawBlocks: readonly VisionExtractedBlock[];
  provenance: ExtractionProvenance;
}): {
  blocks: readonly ResourceExtractedContentBlock[];
  pages: readonly ExtractedPage[];
} {
  const blocks: ResourceExtractedContentBlock[] = [];
  const pageTextMap = new Map<number, string[]>();
  let sortOrder = 1;

  for (const rawBlock of input.rawBlocks) {
    const pageNum = rawBlock.pageNumber > 0 ? rawBlock.pageNumber : 1;
    const sanitizedText = sanitizeExtractedText(rawBlock.text);

    if (sanitizedText.length === 0) {
      continue;
    }

    const blockId =
      `${input.extractionDocumentId}-vb${pageNum}-${sortOrder}` as ResourceExtractedContentBlockId;

    const blockLocator: ResourceSourceLocator = {
      kind: "image_region",
      pageNumber: pageNum,
      slideNumber: null,
      boundingBox: null,
      textSpan: null,
      timeRange: null,
      label: `Image Page ${pageNum}, Block ${sortOrder}`,
    };

    blocks.push({
      blockId,
      kind: rawBlock.kind,
      text: sanitizedText,
      locator: blockLocator,
      sortOrder,
      parentBlockId: null,
      confidence: rawBlock.confidence ?? 0.9,
    });

    const currentList = pageTextMap.get(pageNum) ?? [];
    currentList.push(sanitizedText);
    pageTextMap.set(pageNum, currentList);

    sortOrder += 1;
  }

  const pages: ExtractedPage[] = [];
  const sortedPageNumbers = [...pageTextMap.keys()].sort((a, b) => a - b);

  for (const pageNumber of sortedPageNumbers) {
    const pageTexts = pageTextMap.get(pageNumber) ?? [];
    const fullPageText = pageTexts.join("\n\n");

    const pageId =
      `${input.extractionDocumentId}-page-${pageNumber}` as ResourceExtractedPageId;

    const pageLocator: ResourceSourceLocator = {
      kind: "document_page",
      pageNumber,
      slideNumber: null,
      boundingBox: null,
      textSpan: {
        startOffset: 0,
        endOffset: fullPageText.length,
      },
      timeRange: null,
      label: `Page ${pageNumber}`,
    };

    pages.push({
      pageId,
      pageNumber,
      text: fullPageText,
      locator: pageLocator,
      confidence: 0.9,
      provenance: input.provenance,
      failure: null,
    });
  }

  return { blocks, pages };
}
