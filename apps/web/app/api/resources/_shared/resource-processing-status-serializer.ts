import type {
  ResourceProcessingStatusResponseBody,
} from "@avora/core/contracts/resources";

import type {
  WebResourceProcessingStatus,
} from "./resource-processing-status-composition";

export function serializeResourceProcessingStatus(
  status: WebResourceProcessingStatus,
): ResourceProcessingStatusResponseBody {
  return {
    resource: {
      resourceId: status.resource.resourceId,
      lifecycleState: status.resource.lifecycleState,
      originalFilename: status.resource.originalFilename,
      declaredMimeType: status.resource.declaredMimeType,
      updatedAt: status.resource.updatedAt,
    },
    processing: status.processing,
    extraction:
      status.extraction === null
        ? null
        : {
          extractionDocumentId: status.extraction.extractionDocumentId,
          outcome: status.extraction.status,
          extractedAt: status.extraction.extractedAt,
        },
    ...(status.extraction === null
      ? {}
      : {
        preview: {
          pageCount: status.pages.length,
          extractedPageCount: status.pages.filter((page) =>
            !hasFailureForPage({
              pageNumber: page.pageNumber,
              failures: status.failures,
            }),
          ).length,
          failedPageCount: countFailedPages(status),
          blockCount: status.blocks.length,
          characterCount: countExtractedCharacters(status),
          provenanceSources: [
            ...new Set(status.provenance.map((record) => record.source)),
          ].sort(),
        },
      }),
    ...(status.failures.length === 0
      ? {}
      : {
        failures: status.failures.map((failure) => ({
          failureId: failure.failureId,
          code: failure.code,
          message: failure.message,
          pageNumber: failure.pageNumber,
        })),
      }),
  };
}

function hasFailureForPage(
  input: Readonly<{
    pageNumber: number;
    failures: WebResourceProcessingStatus["failures"];
  }>,
): boolean {
  return input.failures.some((failure) =>
    failure.pageNumber === input.pageNumber,
  );
}

function countFailedPages(status: WebResourceProcessingStatus): number {
  return new Set(
    status.failures
      .map((failure) => failure.pageNumber)
      .filter((pageNumber): pageNumber is number => pageNumber !== null),
  ).size;
}

function countExtractedCharacters(status: WebResourceProcessingStatus): number {
  const pageCharacters = status.pages.reduce(
    (sum, page) => sum + page.text.length,
    0,
  );

  const blockCharacters = status.blocks.reduce(
    (sum, block) => sum + block.text.length,
    0,
  );

  return pageCharacters + blockCharacters;
}