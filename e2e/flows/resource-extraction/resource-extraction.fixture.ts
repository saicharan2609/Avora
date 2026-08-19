import type {
  ResourceId,
  StudentId,
} from "@avora/core/identity";
import type {
  IsoDateTimeString,
} from "@avora/core/time";
import type {
  ExtractedPage,
  ExtractedResourceContent,
  ExtractionProvenance,
  ResourceExtractedContentBlock,
  ResourceExtractionDocument,
  ResourceExtractionFailure,
  ResourceExtractionRequest,
  ResourceExtractionResult,
  ResourceSourceLocator,
  UnsupportedPageExtractionFailure,
} from "@avora/domain/resources";
import type {
  ResourceExtractionJobRequest,
} from "@avora/jobs/resource-extraction";

export type ResourceExtractionE2eScenario =
  | "success"
  | "partial"
  | "failed";

export type ResourceExtractionE2eFixture = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  extractionDocumentId: ResourceExtractionRequest["extractionDocumentId"];
  requestedAt: IsoDateTimeString;
  extractedAt: IsoDateTimeString;
  extractionStrategyVersion: ResourceExtractionRequest["extractionStrategyVersion"];
  chunkingStrategyVersion: ResourceExtractionRequest["chunkingStrategyVersion"];
  originalFilename: string;
  declaredMimeType: string;
  byteSize: number;
  contentHash: string;
  storage: ResourceExtractionJobRequest["payload"]["storage"];
}>;

export const resourceExtractionE2eSuccessFixture = {
  studentId:
    "00000000-0000-4000-8000-0000000107a1" as StudentId,
  resourceId:
    "00000000-0000-4000-8000-000000010701" as ResourceId,
  extractionDocumentId:
    "00000000-0000-4000-8000-000000010721" as ResourceExtractionRequest["extractionDocumentId"],
  requestedAt:
    "2026-08-19T18:00:00.000Z" as IsoDateTimeString,
  extractedAt:
    "2026-08-19T18:00:05.000Z" as IsoDateTimeString,
  extractionStrategyVersion:
    "extractor.stage10-g7.v1" as ResourceExtractionRequest["extractionStrategyVersion"],
  chunkingStrategyVersion:
    "chunker.stage10-g7.v1" as ResourceExtractionRequest["chunkingStrategyVersion"],
  originalFilename: "stage-10-g7-synthetic-success.pdf",
  declaredMimeType: "application/pdf",
  byteSize: 4096,
  contentHash:
    "sha256:stage10g7success000000000000000000000000000000000000000000000001",
  storage: {
    bucket: "resources",
    objectPath:
      "students/00000000-0000-4000-8000-0000000107a1/resources/00000000-0000-4000-8000-000000010701/original.pdf",
  },
} as const satisfies ResourceExtractionE2eFixture;

export const resourceExtractionE2ePartialFixture = {
  studentId:
    "00000000-0000-4000-8000-0000000107a1" as StudentId,
  resourceId:
    "00000000-0000-4000-8000-000000010702" as ResourceId,
  extractionDocumentId:
    "00000000-0000-4000-8000-000000010722" as ResourceExtractionRequest["extractionDocumentId"],
  requestedAt:
    "2026-08-19T18:01:00.000Z" as IsoDateTimeString,
  extractedAt:
    "2026-08-19T18:01:05.000Z" as IsoDateTimeString,
  extractionStrategyVersion:
    "extractor.stage10-g7.v1" as ResourceExtractionRequest["extractionStrategyVersion"],
  chunkingStrategyVersion:
    "chunker.stage10-g7.v1" as ResourceExtractionRequest["chunkingStrategyVersion"],
  originalFilename: "stage-10-g7-synthetic-partial.pdf",
  declaredMimeType: "application/pdf",
  byteSize: 6144,
  contentHash:
    "sha256:stage10g7partial000000000000000000000000000000000000000000000001",
  storage: {
    bucket: "resources",
    objectPath:
      "students/00000000-0000-4000-8000-0000000107a1/resources/00000000-0000-4000-8000-000000010702/original.pdf",
  },
} as const satisfies ResourceExtractionE2eFixture;

export const resourceExtractionE2eFailedFixture = {
  studentId:
    "00000000-0000-4000-8000-0000000107a1" as StudentId,
  resourceId:
    "00000000-0000-4000-8000-000000010703" as ResourceId,
  extractionDocumentId:
    "00000000-0000-4000-8000-000000010723" as ResourceExtractionRequest["extractionDocumentId"],
  requestedAt:
    "2026-08-19T18:02:00.000Z" as IsoDateTimeString,
  extractedAt:
    "2026-08-19T18:02:05.000Z" as IsoDateTimeString,
  extractionStrategyVersion:
    "extractor.stage10-g7.v1" as ResourceExtractionRequest["extractionStrategyVersion"],
  chunkingStrategyVersion:
    "chunker.stage10-g7.v1" as ResourceExtractionRequest["chunkingStrategyVersion"],
  originalFilename: "stage-10-g7-synthetic-failed.pdf",
  declaredMimeType: "application/pdf",
  byteSize: 2048,
  contentHash:
    "sha256:stage10g7failed0000000000000000000000000000000000000000000000001",
  storage: {
    bucket: "resources",
    objectPath:
      "students/00000000-0000-4000-8000-0000000107a1/resources/00000000-0000-4000-8000-000000010703/original.pdf",
  },
} as const satisfies ResourceExtractionE2eFixture;

export function createResourceExtractionE2eJobRequest(
  input: Readonly<{
    fixture: ResourceExtractionE2eFixture;
  }>,
): ResourceExtractionJobRequest {
  return {
    name: "resource.extraction.extract",
    reason: "resource_validation_succeeded",
    priority: "normal",
    payload: {
      extractionDocumentId: input.fixture.extractionDocumentId,
      studentId: input.fixture.studentId,
      resourceId: input.fixture.resourceId,
      storage: input.fixture.storage,
      declaredMimeType: input.fixture.declaredMimeType,
      byteSize: input.fixture.byteSize,
      contentHash: input.fixture.contentHash,
      extractionStrategyVersion: input.fixture.extractionStrategyVersion,
      chunkingStrategyVersion: input.fixture.chunkingStrategyVersion,
      requestedAt: input.fixture.requestedAt,
    },
  };
}

export function createResourceExtractionE2eResult(
  input: Readonly<{
    fixture: ResourceExtractionE2eFixture;
    scenario: ResourceExtractionE2eScenario;
  }>,
): ResourceExtractionResult {
  if (input.scenario === "failed") {
    return {
      outcome: "failed",
      failure: createExtractorFailure({
        failureId: "00000000-0000-4000-8000-000000010751",
        message: "Synthetic terminal extraction failure for Stage 10 Group 7.",
      }),
    };
  }

  if (input.scenario === "partial") {
    return createPartiallyExtractedResult(input.fixture);
  }

  return createExtractedResult(input.fixture);
}

function createExtractedResult(
  fixture: ResourceExtractionE2eFixture,
): ResourceExtractionResult {
  const documentProvenance = createProvenance({
    provenanceId: "00000000-0000-4000-8000-000000010731",
    source: "document_text",
    extractedAt: fixture.extractedAt,
    strategyVersion: fixture.extractionStrategyVersion,
    notes: "Synthetic Stage 10 G7 document provenance.",
  });

  const pageProvenance = createProvenance({
    provenanceId: "00000000-0000-4000-8000-000000010732",
    source: "document_text",
    extractedAt: fixture.extractedAt,
    strategyVersion: fixture.extractionStrategyVersion,
    notes: "Synthetic Stage 10 G7 page provenance.",
  });

  const blocks = [
    createBlock({
      blockId: "00000000-0000-4000-8000-000000010741",
      kind: "heading",
      text: "Stage 10 G7 Synthetic Extraction",
      sortOrder: 0,
      pageNumber: 1,
      label: "Synthetic success heading",
      confidence: 0.98,
      parentBlockId: null,
    }),
    createBlock({
      blockId: "00000000-0000-4000-8000-000000010742",
      kind: "paragraph",
      text: "The extraction pipeline persists a document, page, block, and provenance records.",
      sortOrder: 1,
      pageNumber: 1,
      label: "Synthetic success paragraph",
      confidence: 0.96,
      parentBlockId: null,
    }),
  ] as const;

  const pages = [
    createPage({
      pageId: "00000000-0000-4000-8000-000000010761",
      pageNumber: 1,
      text: "Stage 10 G7 Synthetic Extraction. The extraction pipeline persists a document, page, block, and provenance records.",
      confidence: 0.97,
      provenance: pageProvenance,
      failure: null,
    }),
  ] as const;

  return {
    outcome: "extracted",
    document: createDocument({
      fixture,
      status: "extracted",
      blocks,
    }),
    content: createContent({
      fixture,
      provenance: documentProvenance,
      pages,
      blocks,
    }),
  };
}

function createPartiallyExtractedResult(
  fixture: ResourceExtractionE2eFixture,
): ResourceExtractionResult {
  const warning = createExtractorFailure({
    failureId: "00000000-0000-4000-8000-000000010752",
    message: "Synthetic partial extraction warning for Stage 10 Group 7.",
  });

  const unsupportedPageFailure = createUnsupportedPageFailure({
    failureId: "00000000-0000-4000-8000-000000010753",
    pageNumber: 2,
    message: "Synthetic unsupported page reported honestly by Stage 10 Group 7.",
  });

  const documentProvenance = createProvenance({
    provenanceId: "00000000-0000-4000-8000-000000010733",
    source: "document_text",
    extractedAt: fixture.extractedAt,
    strategyVersion: fixture.extractionStrategyVersion,
    notes: "Synthetic Stage 10 G7 partial document provenance.",
  });

  const readablePageProvenance = createProvenance({
    provenanceId: "00000000-0000-4000-8000-000000010734",
    source: "document_text",
    extractedAt: fixture.extractedAt,
    strategyVersion: fixture.extractionStrategyVersion,
    notes: "Synthetic Stage 10 G7 readable page provenance.",
  });

  const unsupportedPageProvenance = createProvenance({
    provenanceId: "00000000-0000-4000-8000-000000010735",
    source: "scan",
    extractedAt: fixture.extractedAt,
    strategyVersion: fixture.extractionStrategyVersion,
    notes: "Synthetic Stage 10 G7 unsupported page provenance.",
  });

  const blocks = [
    createBlock({
      blockId: "00000000-0000-4000-8000-000000010743",
      kind: "paragraph",
      text: "The partial extraction preserves usable content from the readable page.",
      sortOrder: 0,
      pageNumber: 1,
      label: "Synthetic partial readable content",
      confidence: 0.91,
      parentBlockId: null,
    }),
  ] as const;

  const pages = [
    createPage({
      pageId: "00000000-0000-4000-8000-000000010762",
      pageNumber: 1,
      text: "The partial extraction preserves usable content from the readable page.",
      confidence: 0.91,
      provenance: readablePageProvenance,
      failure: null,
    }),
    createPage({
      pageId: "00000000-0000-4000-8000-000000010763",
      pageNumber: 2,
      text: "Unsupported synthetic page placeholder.",
      confidence: null,
      provenance: unsupportedPageProvenance,
      failure: unsupportedPageFailure,
    }),
  ] as const;

  return {
    outcome: "partially_extracted",
    document: createDocument({
      fixture,
      status: "partially_extracted",
      blocks,
    }),
    content: createContent({
      fixture,
      provenance: documentProvenance,
      pages,
      blocks,
    }),
    warning,
  };
}

function createDocument(
  input: Readonly<{
    fixture: ResourceExtractionE2eFixture;
    status: ResourceExtractionDocument["status"];
    blocks: readonly ResourceExtractedContentBlock[];
  }>,
): ResourceExtractionDocument {
  return {
    extractionDocumentId: input.fixture.extractionDocumentId,
    studentId: input.fixture.studentId,
    resourceId: input.fixture.resourceId,
    status: input.status,
    extractionStrategyVersion: input.fixture.extractionStrategyVersion,
    chunkingStrategyVersion: input.fixture.chunkingStrategyVersion,
    extractedAt: input.fixture.extractedAt,
    blocks: input.blocks,
  };
}

function createContent(
  input: Readonly<{
    fixture: ResourceExtractionE2eFixture;
    provenance: ExtractionProvenance;
    pages: readonly ExtractedPage[];
    blocks: readonly ResourceExtractedContentBlock[];
  }>,
): ExtractedResourceContent {
  return {
    extractionDocumentId: input.fixture.extractionDocumentId,
    studentId: input.fixture.studentId,
    resourceId: input.fixture.resourceId,
    extractionStrategyVersion: input.fixture.extractionStrategyVersion,
    chunkingStrategyVersion: input.fixture.chunkingStrategyVersion,
    pages: input.pages,
    blocks: input.blocks,
    provenance: input.provenance,
    extractedAt: input.fixture.extractedAt,
  };
}

function createPage(
  input: Readonly<{
    pageId: string;
    pageNumber: number;
    text: string;
    confidence: number | null;
    provenance: ExtractionProvenance;
    failure: UnsupportedPageExtractionFailure | null;
  }>,
): ExtractedPage {
  return {
    pageId: input.pageId as ExtractedPage["pageId"],
    pageNumber: input.pageNumber,
    text: input.text,
    locator: createPageLocator({
      pageNumber: input.pageNumber,
      label: `Synthetic page ${input.pageNumber}`,
    }),
    confidence: input.confidence,
    provenance: input.provenance,
    failure: input.failure,
  };
}

function createBlock(
  input: Readonly<{
    blockId: string;
    kind: ResourceExtractedContentBlock["kind"];
    text: string;
    sortOrder: number;
    pageNumber: number;
    label: string;
    confidence: number | null;
    parentBlockId: ResourceExtractedContentBlock["parentBlockId"];
  }>,
): ResourceExtractedContentBlock {
  return {
    blockId: input.blockId as ResourceExtractedContentBlock["blockId"],
    kind: input.kind,
    text: input.text,
    locator: createPageLocator({
      pageNumber: input.pageNumber,
      label: input.label,
    }),
    sortOrder: input.sortOrder,
    parentBlockId: input.parentBlockId,
    confidence: input.confidence,
  };
}

function createProvenance(
  input: Readonly<{
    provenanceId: string;
    source: ExtractionProvenance["source"];
    strategyVersion: ExtractionProvenance["strategyVersion"];
    extractedAt: IsoDateTimeString;
    notes: string | null;
  }>,
): ExtractionProvenance {
  return {
    provenanceId: input.provenanceId as ExtractionProvenance["provenanceId"],
    source: input.source,
    strategyVersion: input.strategyVersion,
    extractedAt: input.extractedAt,
    notes: input.notes,
  };
}

function createUnsupportedPageFailure(
  input: Readonly<{
    failureId: string;
    pageNumber: number;
    message: string;
  }>,
): UnsupportedPageExtractionFailure {
  return {
    failureId: input.failureId as UnsupportedPageExtractionFailure["failureId"],
    code: "unsupported_page",
    message: input.message,
    pageNumber: input.pageNumber,
  };
}

function createExtractorFailure(
  input: Readonly<{
    failureId: string;
    message: string;
  }>,
): ResourceExtractionFailure {
  return {
    failureId: input.failureId as ResourceExtractionFailure["failureId"],
    code: "extractor_failed",
    message: input.message,
  };
}

function createPageLocator(
  input: Readonly<{
    pageNumber: number;
    label: string;
  }>,
): ResourceSourceLocator {
  return {
    kind: "document_page",
    pageNumber: input.pageNumber,
    slideNumber: null,
    boundingBox: null,
    textSpan: null,
    timeRange: null,
    label: input.label,
  };
}