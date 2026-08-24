import type { ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";
import type {
  ExtractionPort,
  ResourceChunkingStrategyVersion,
  ResourceExtractionDocumentId,
  ResourceExtractionFailureId,
  ResourceExtractionProvenanceId,
  ResourceExtractionRequest,
  ResourceExtractionResult,
  ResourceExtractionStrategyVersion,
} from "@avora/domain/resources";

import { createCompositeResourceExtractionAdapter } from "../composite/CompositeResourceExtractionAdapter.js";

class CompositeResourceExtractionAdapterTestFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "CompositeResourceExtractionAdapterTestFailure";
  }
}

function assert(
  condition: boolean,
  caseId: string,
  reason: string,
): asserts condition {
  if (!condition) {
    throw new CompositeResourceExtractionAdapterTestFailure(caseId, reason);
  }
}

const defaultDocumentId = "ext-doc-789" as ResourceExtractionDocumentId;
const defaultStudentId = "student-789" as StudentId;
const defaultResourceId = "resource-789" as ResourceId;
const defaultExtractionStrategy = "ext-v1" as ResourceExtractionStrategyVersion;
const defaultChunkingStrategy = "chunk-v1" as ResourceChunkingStrategyVersion;
const defaultProvenanceId = "p1" as ResourceExtractionProvenanceId;
const defaultIsoDate = "2026-08-24T00:00:00Z" as IsoDateTimeString;

const createMockRequest = (
  overrides: Partial<ResourceExtractionRequest> = {},
): ResourceExtractionRequest => ({
  extractionDocumentId: defaultDocumentId,
  studentId: defaultStudentId,
  resourceId: defaultResourceId,
  storage: {
    bucket: "quarantine",
    objectPath: "students/student-789/doc.pdf",
    version: 1,
  },
  declaredMimeType: "application/pdf",
  contentHash: "hash-789",
  extractionStrategyVersion: defaultExtractionStrategy,
  chunkingStrategyVersion: defaultChunkingStrategy,
  ...overrides,
});

async function runRoutesPdfCase(): Promise<void> {
  const caseId = "composite-routes-pdf";
  let pdfCalled = false;
  let visionCalled = false;

  const mockPdfAdapter: ExtractionPort = {
    extractResourceContent: async (req): Promise<ResourceExtractionResult> => {
      pdfCalled = true;
      return {
        outcome: "extracted",
        document: {
          extractionDocumentId: req.extractionDocumentId,
          studentId: req.studentId,
          resourceId: req.resourceId,
          status: "extracted",
          extractionStrategyVersion: req.extractionStrategyVersion,
          chunkingStrategyVersion: req.chunkingStrategyVersion,
          extractedAt: defaultIsoDate,
          blocks: [],
        },
        content: {
          extractionDocumentId: req.extractionDocumentId,
          studentId: req.studentId,
          resourceId: req.resourceId,
          extractionStrategyVersion: req.extractionStrategyVersion,
          chunkingStrategyVersion: req.chunkingStrategyVersion,
          pages: [],
          blocks: [],
          provenance: {
            provenanceId: defaultProvenanceId,
            source: "document_text",
            strategyVersion: defaultExtractionStrategy,
            extractedAt: defaultIsoDate,
            notes: null,
          },
          extractedAt: defaultIsoDate,
        },
      };
    },
  };

  const mockVisionAdapter: ExtractionPort = {
    extractResourceContent: async (): Promise<ResourceExtractionResult> => {
      visionCalled = true;
      throw new Error("Should not be called");
    },
  };

  const composite = createCompositeResourceExtractionAdapter({
    pdfAdapter: mockPdfAdapter,
    visionAdapter: mockVisionAdapter,
  });

  const result = await composite.extractResourceContent(
    createMockRequest({ declaredMimeType: "application/pdf" }),
  );

  assert(pdfCalled, caseId, "pdf adapter must be called");
  assert(!visionCalled, caseId, "vision adapter must not be called");
  assert(result.outcome === "extracted", caseId, "outcome must be extracted");
}

async function runRoutesImageCase(): Promise<void> {
  const caseId = "composite-routes-image";
  let visionCalled = false;

  const mockPdfAdapter: ExtractionPort = {
    extractResourceContent: async (): Promise<ResourceExtractionResult> => {
      throw new Error("Should not be called");
    },
  };

  const mockVisionAdapter: ExtractionPort = {
    extractResourceContent: async (req): Promise<ResourceExtractionResult> => {
      visionCalled = true;
      return {
        outcome: "extracted",
        document: {
          extractionDocumentId: req.extractionDocumentId,
          studentId: req.studentId,
          resourceId: req.resourceId,
          status: "extracted",
          extractionStrategyVersion: req.extractionStrategyVersion,
          chunkingStrategyVersion: req.chunkingStrategyVersion,
          extractedAt: defaultIsoDate,
          blocks: [],
        },
        content: {
          extractionDocumentId: req.extractionDocumentId,
          studentId: req.studentId,
          resourceId: req.resourceId,
          extractionStrategyVersion: req.extractionStrategyVersion,
          chunkingStrategyVersion: req.chunkingStrategyVersion,
          pages: [],
          blocks: [],
          provenance: {
            provenanceId: defaultProvenanceId,
            source: "ocr",
            strategyVersion: defaultExtractionStrategy,
            extractedAt: defaultIsoDate,
            notes: null,
          },
          extractedAt: defaultIsoDate,
        },
      };
    },
  };

  const composite = createCompositeResourceExtractionAdapter({
    pdfAdapter: mockPdfAdapter,
    visionAdapter: mockVisionAdapter,
  });

  const result = await composite.extractResourceContent(
    createMockRequest({ declaredMimeType: "image/png" }),
  );

  assert(visionCalled, caseId, "vision adapter must be called");
  assert(result.outcome === "extracted", caseId, "outcome must be extracted");
}

async function runFailsClosedOnUnsupportedMimeCase(): Promise<void> {
  const caseId = "composite-fails-closed-unsupported-mime";
  const composite = createCompositeResourceExtractionAdapter({
    pdfAdapter: {
      extractResourceContent: async () => ({
        outcome: "failed",
        failure: {
          failureId: "f1" as ResourceExtractionFailureId,
          code: "extractor_failed",
          message: "fail",
        },
      }),
    },
  });

  const result = await composite.extractResourceContent(
    createMockRequest({ declaredMimeType: "video/mp4" }),
  );

  assert(result.outcome === "failed", caseId, "outcome must be failed");
  if (result.outcome === "failed") {
    assert(
      result.failure.code === "unsupported_mime_type",
      caseId,
      "failure code must be unsupported_mime_type",
    );
  }
}

export async function runCompositeResourceExtractionAdapterUnitSuite(): Promise<void> {
  await runRoutesPdfCase();
  await runRoutesImageCase();
  await runFailsClosedOnUnsupportedMimeCase();
}

await runCompositeResourceExtractionAdapterUnitSuite();
