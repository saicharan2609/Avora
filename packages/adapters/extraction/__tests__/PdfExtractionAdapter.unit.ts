import type { ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";
import type {
  ResourceChunkingStrategyVersion,
  ResourceExtractionDocumentId,
  ResourceExtractionProvenanceId,
  ResourceExtractionRequest,
  ResourceExtractionStrategyVersion,
} from "@avora/domain/resources";

import { createPdfExtractionAdapter } from "../pdf/PdfExtractionAdapter.js";
import { parsePdfStructure } from "../pdf/PdfStructureParser.js";

class PdfExtractionAdapterTestFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "PdfExtractionAdapterTestFailure";
  }
}

function assert(
  condition: boolean,
  caseId: string,
  reason: string,
): asserts condition {
  if (!condition) {
    throw new PdfExtractionAdapterTestFailure(caseId, reason);
  }
}

const defaultDocumentId = "ext-doc-123" as ResourceExtractionDocumentId;
const defaultStudentId = "student-123" as StudentId;
const defaultResourceId = "resource-123" as ResourceId;
const defaultExtractionStrategy = "ext-v1" as ResourceExtractionStrategyVersion;
const defaultChunkingStrategy = "chunk-v1" as ResourceChunkingStrategyVersion;
const defaultProvenanceId = "prov-1" as ResourceExtractionProvenanceId;
const defaultIsoDate = "2026-08-24T00:00:00Z" as IsoDateTimeString;

const createMockRequest = (
  overrides: Partial<ResourceExtractionRequest> = {},
): ResourceExtractionRequest => ({
  extractionDocumentId: defaultDocumentId,
  studentId: defaultStudentId,
  resourceId: defaultResourceId,
  storage: {
    bucket: "quarantine",
    objectPath: "students/student-123/file.pdf",
    version: 1,
  },
  declaredMimeType: "application/pdf",
  contentHash: "hash-123",
  extractionStrategyVersion: defaultExtractionStrategy,
  chunkingStrategyVersion: defaultChunkingStrategy,
  ...overrides,
});

async function runPdfStructureParserCase(): Promise<void> {
  const caseId = "pdf-structure-parser-extracts-blocks";
  const rawPages = [
    {
      pageNumber: 1,
      text: `Section 3: Database Normalization

Normalization is the process of organizing data in a database.

Key Goals:
• Eliminate redundant data
• Ensure data dependencies make sense

| Normal Form | Requirement |
| 1NF | Atomic values |
| 2NF | No partial dependency |

Formula for functional dependency: \\( X \\rightarrow Y \\)

SELECT * FROM normalization_rules;`,
    },
  ];

  const result = parsePdfStructure({
    extractionDocumentId: defaultDocumentId,
    rawPages,
    provenance: {
      provenanceId: defaultProvenanceId,
      source: "document_text",
      strategyVersion: defaultExtractionStrategy,
      extractedAt: defaultIsoDate,
      notes: null,
    },
    strategyVersion: defaultExtractionStrategy,
  });

  assert(result.pages.length === 1, caseId, "must have 1 extracted page");
  assert(result.pages[0]?.pageNumber === 1, caseId, "page number must be 1");
  assert(
    result.pages[0]?.confidence === 0.98,
    caseId,
    "page confidence must be 0.98",
  );

  const blockKinds = result.blocks.map((b) => b.kind);
  assert(blockKinds.includes("heading"), caseId, "must identify heading block");
  assert(
    blockKinds.includes("paragraph"),
    caseId,
    "must identify paragraph block",
  );
  assert(blockKinds.includes("list"), caseId, "must identify list block");
  assert(blockKinds.includes("table"), caseId, "must identify table block");
  assert(blockKinds.includes("formula"), caseId, "must identify formula block");
  assert(blockKinds.includes("code"), caseId, "must identify code block");
}

async function runPdfExtractionAdapterSuccessCase(): Promise<void> {
  const caseId = "pdf-extraction-adapter-success";
  const adapter = createPdfExtractionAdapter({
    pageReader: async () => [
      {
        pageNumber: 1,
        text: "Section 1: Operating Systems\n\nAn operating system manages computer hardware.",
      },
      {
        pageNumber: 2,
        text: "Section 2: Process Scheduling\n\nProcesses are scheduled using algorithms like Round Robin.",
      },
    ],
  });

  const result = await adapter.extractResourceContent(createMockRequest());

  assert(result.outcome === "extracted", caseId, "outcome must be extracted");
  if (result.outcome === "extracted") {
    assert(
      result.document.blocks.length === 4,
      caseId,
      "document blocks length must be 4",
    );
    assert(
      result.content.pages.length === 2,
      caseId,
      "content pages must be 2",
    );
    assert(
      result.content.blocks.length === 4,
      caseId,
      "content blocks must be 4",
    );
    assert(
      result.content.provenance.source === "document_text",
      caseId,
      "provenance source must be document_text",
    );
    assert(
      result.content.provenance.notes === "avora.pdf.parser.v1",
      caseId,
      "provenance notes must match",
    );
  }
}

async function runPdfExtractionAdapterUnsupportedMimeCase(): Promise<void> {
  const caseId = "pdf-extraction-adapter-unsupported-mime";
  const adapter = createPdfExtractionAdapter();
  const result = await adapter.extractResourceContent(
    createMockRequest({ declaredMimeType: "image/png" }),
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

async function runPdfExtractionAdapterEmptyDocumentCase(): Promise<void> {
  const caseId = "pdf-extraction-adapter-empty-document";
  const adapter = createPdfExtractionAdapter({
    pageReader: async () => [],
  });

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

export async function runPdfExtractionAdapterUnitSuite(): Promise<void> {
  await runPdfStructureParserCase();
  await runPdfExtractionAdapterSuccessCase();
  await runPdfExtractionAdapterUnsupportedMimeCase();
  await runPdfExtractionAdapterEmptyDocumentCase();
}

await runPdfExtractionAdapterUnitSuite();
