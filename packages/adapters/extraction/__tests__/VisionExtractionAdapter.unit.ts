import type { ResourceId, StudentId } from "@avora/core/identity";
import type {
  ResourceChunkingStrategyVersion,
  ResourceExtractionDocumentId,
  ResourceExtractionRequest,
  ResourceExtractionStrategyVersion,
} from "@avora/domain/resources";

import { createVisionExtractionAdapter } from "../vision/VisionExtractionAdapter.js";
import type { VisionExtractionClient } from "../vision/VisionExtractionClient.js";

class VisionExtractionAdapterTestFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "VisionExtractionAdapterTestFailure";
  }
}

function assert(
  condition: boolean,
  caseId: string,
  reason: string,
): asserts condition {
  if (!condition) {
    throw new VisionExtractionAdapterTestFailure(caseId, reason);
  }
}

const defaultDocumentId = "ext-doc-456" as ResourceExtractionDocumentId;
const defaultStudentId = "student-456" as StudentId;
const defaultResourceId = "resource-456" as ResourceId;
const defaultExtractionStrategy = "ext-v1" as ResourceExtractionStrategyVersion;
const defaultChunkingStrategy = "chunk-v1" as ResourceChunkingStrategyVersion;

const createMockRequest = (
  overrides: Partial<ResourceExtractionRequest> = {},
): ResourceExtractionRequest => ({
  extractionDocumentId: defaultDocumentId,
  studentId: defaultStudentId,
  resourceId: defaultResourceId,
  storage: {
    bucket: "quarantine",
    objectPath: "students/student-456/notes.jpg",
    version: 1,
  },
  declaredMimeType: "image/jpeg",
  contentHash: "hash-456",
  extractionStrategyVersion: defaultExtractionStrategy,
  chunkingStrategyVersion: defaultChunkingStrategy,
  ...overrides,
});

async function runVisionExtractionAdapterSuccessCase(): Promise<void> {
  const caseId = "vision-extraction-adapter-success";
  const mockClient: VisionExtractionClient = {
    extractVisionContent: async () => ({
      pageCount: 1,
      blocks: [
        {
          kind: "heading",
          text: "Handwritten Notes: CPU Scheduling",
          pageNumber: 1,
          confidence: 0.92,
        },
        {
          kind: "paragraph",
          text: "Round Robin uses a time quantum q to allocate CPU fairly.",
          pageNumber: 1,
          confidence: 0.88,
        },
      ],
    }),
  };

  const adapter = createVisionExtractionAdapter({ client: mockClient });
  const result = await adapter.extractResourceContent(createMockRequest());

  assert(result.outcome === "extracted", caseId, "outcome must be extracted");
  if (result.outcome === "extracted") {
    assert(
      result.document.blocks.length === 2,
      caseId,
      "document blocks length must be 2",
    );
    assert(result.content.pages.length === 1, caseId, "pages length must be 1");
    assert(
      result.content.blocks[0]?.kind === "heading",
      caseId,
      "block 0 kind must be heading",
    );
    assert(
      result.content.blocks[1]?.kind === "paragraph",
      caseId,
      "block 1 kind must be paragraph",
    );
    assert(
      result.content.provenance.source === "ocr",
      caseId,
      "provenance source must be ocr",
    );
    assert(
      result.content.provenance.notes === "google.gemini.vision",
      caseId,
      "provenance notes must match",
    );
  }
}

async function runVisionExtractionAdapterUnsupportedMimeCase(): Promise<void> {
  const caseId = "vision-extraction-adapter-unsupported-mime";
  const mockClient: VisionExtractionClient = {
    extractVisionContent: async () => ({ pageCount: 0, blocks: [] }),
  };

  const adapter = createVisionExtractionAdapter({ client: mockClient });
  const result = await adapter.extractResourceContent(
    createMockRequest({ declaredMimeType: "application/pdf" }),
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

async function runVisionExtractionAdapterEmptyResponseCase(): Promise<void> {
  const caseId = "vision-extraction-adapter-empty-response";
  const mockClient: VisionExtractionClient = {
    extractVisionContent: async () => ({ pageCount: 0, blocks: [] }),
  };

  const adapter = createVisionExtractionAdapter({ client: mockClient });
  const result = await adapter.extractResourceContent(createMockRequest());

  assert(result.outcome === "failed", caseId, "outcome must be failed");
  if (result.outcome === "failed") {
    assert(
      result.failure.code === "empty_extraction",
      caseId,
      "failure code must be empty_extraction",
    );
  }
}

export async function runVisionExtractionAdapterUnitSuite(): Promise<void> {
  await runVisionExtractionAdapterSuccessCase();
  await runVisionExtractionAdapterUnsupportedMimeCase();
  await runVisionExtractionAdapterEmptyResponseCase();
}

await runVisionExtractionAdapterUnitSuite();
