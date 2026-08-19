export type ResourceExtractionQualityExpectedOutcome = "pass" | "fail";

export type ResourceExtractionQualityCaseKind =
  | "coverage"
  | "partial_honesty"
  | "handwriting_scan"
  | "unsupported_page_honesty"
  | "failure_correctness";

export type SyntheticExtractionProvenanceSource =
  | "document_text"
  | "ocr"
  | "scan"
  | "handwriting"
  | "manual"
  | "system";

export type SyntheticExtractionFailureCode =
  | "resource_not_processable"
  | "storage_object_unavailable"
  | "unsupported_mime_type"
  | "unsupported_resource_kind"
  | "unsupported_page"
  | "empty_extraction"
  | "extractor_failed";

export type SyntheticResourceSourceLocator = Readonly<{
  kind:
    | "document_page"
    | "slide"
    | "image_region"
    | "audio_time_range"
    | "video_time_range"
    | "text_span"
    | "unknown";
  pageNumber: number | null;
  slideNumber: number | null;
  boundingBox: Readonly<{
    x: number;
    y: number;
    width: number;
    height: number;
    unit: "ratio" | "point" | "pixel";
  }> | null;
  textSpan: Readonly<{
    startOffset: number;
    endOffset: number;
  }> | null;
  timeRange: Readonly<{
    startSeconds: number;
    endSeconds: number;
  }> | null;
  label: string | null;
}>;

export type SyntheticExtractionProvenance = Readonly<{
  provenanceId: string;
  source: SyntheticExtractionProvenanceSource;
  strategyVersion: string;
  extractedAt: string;
  notes: string | null;
}>;

export type SyntheticExtractionFailure = Readonly<{
  failureId: string;
  code: SyntheticExtractionFailureCode;
  message: string;
}>;

export type SyntheticUnsupportedPageExtractionFailure =
  SyntheticExtractionFailure &
    Readonly<{
      code: "unsupported_page";
      pageNumber: number;
    }>;

export type SyntheticExtractedPage = Readonly<{
  pageId: string;
  pageNumber: number;
  text: string;
  locator: SyntheticResourceSourceLocator;
  confidence: number | null;
  provenance: SyntheticExtractionProvenance;
  failure: SyntheticUnsupportedPageExtractionFailure | null;
}>;

export type SyntheticExtractedContentBlock = Readonly<{
  blockId: string;
  kind:
    | "heading"
    | "paragraph"
    | "list"
    | "table"
    | "formula"
    | "code"
    | "figure"
    | "diagram"
    | "transcript"
    | "metadata"
    | "unknown";
  text: string;
  locator: SyntheticResourceSourceLocator;
  sortOrder: number;
  parentBlockId: string | null;
  confidence: number | null;
}>;

export type SyntheticExtractionDocument = Readonly<{
  extractionDocumentId: string;
  studentId: string;
  resourceId: string;
  status: "extracted" | "partially_extracted" | "failed";
  extractionStrategyVersion: string;
  chunkingStrategyVersion: string;
  extractedAt: string;
  blocks: readonly SyntheticExtractedContentBlock[];
}>;

export type SyntheticExtractedResourceContent = Readonly<{
  extractionDocumentId: string;
  studentId: string;
  resourceId: string;
  extractionStrategyVersion: string;
  chunkingStrategyVersion: string;
  pages: readonly SyntheticExtractedPage[];
  blocks: readonly SyntheticExtractedContentBlock[];
  provenance: SyntheticExtractionProvenance;
  extractedAt: string;
}>;

export type SyntheticResourceExtractionResult =
  | Readonly<{
      outcome: "extracted";
      document: SyntheticExtractionDocument;
      content: SyntheticExtractedResourceContent;
    }>
  | Readonly<{
      outcome: "partially_extracted";
      document: SyntheticExtractionDocument;
      content: SyntheticExtractedResourceContent;
      warning: SyntheticExtractionFailure;
    }>
  | Readonly<{
      outcome: "failed";
      failure: SyntheticExtractionFailure;
    }>;

export type ResourceExtractionQualityExpectations = Readonly<{
  expectedOutcome: ResourceExtractionQualityExpectedOutcome;
  expectedExtractionOutcome: SyntheticResourceExtractionResult["outcome"];
  expectedFragments: readonly string[];
  minCoverageRatio: number;
  minAverageConfidence: number;
  requiredProvenanceSources: readonly SyntheticExtractionProvenanceSource[];
  requiredUnsupportedPageNumbers: readonly number[];
  requiredFailureCodes: readonly SyntheticExtractionFailureCode[];
  requireWarning: boolean;
  requirePageFailure: boolean;
}>;

export type ResourceExtractionQualityEvalCase = Readonly<{
  caseId: string;
  kind: ResourceExtractionQualityCaseKind;
  description: string;
  result: SyntheticResourceExtractionResult;
  expectations: ResourceExtractionQualityExpectations;
}>;

const syntheticStudentId = "00000000-0000-4000-8000-0000000100a1";

const syntheticResourceId = "00000000-0000-4000-8000-000000010101";

const extractedAt = "2026-08-19T09:00:00.000Z";

const extractionStrategyVersion = "extractor.quality-eval.v1";

const chunkingStrategyVersion = "chunker.quality-eval.v1";

export const resourceExtractionQualityEvalCases = [
  {
    caseId: "resource-extraction-quality-extracted-coverage-001",
    kind: "coverage",
    description:
      "A normal extracted synthetic document preserves expected text fragments with sufficient confidence.",
    result: createCoveredExtractedResult(),
    expectations: {
      expectedOutcome: "pass",
      expectedExtractionOutcome: "extracted",
      expectedFragments: [
        "Synthetic Graph Notes",
        "vertices and edges",
        "Vertex; Edge; Path",
      ],
      minCoverageRatio: 1,
      minAverageConfidence: 0.9,
      requiredProvenanceSources: [
        "document_text",
      ],
      requiredUnsupportedPageNumbers: [],
      requiredFailureCodes: [],
      requireWarning: false,
      requirePageFailure: false,
    },
  },
  {
    caseId: "resource-extraction-quality-partial-honesty-001",
    kind: "partial_honesty",
    description:
      "A partially extracted document keeps usable content while honestly reporting an unsupported page.",
    result: createPartiallyExtractedResult(),
    expectations: {
      expectedOutcome: "pass",
      expectedExtractionOutcome: "partially_extracted",
      expectedFragments: [
        "Readable page content",
        "valid extracted formula",
      ],
      minCoverageRatio: 1,
      minAverageConfidence: 0.82,
      requiredProvenanceSources: [
        "document_text",
      ],
      requiredUnsupportedPageNumbers: [
        2,
      ],
      requiredFailureCodes: [
        "unsupported_page",
      ],
      requireWarning: true,
      requirePageFailure: true,
    },
  },
  {
    caseId: "resource-extraction-quality-handwriting-scan-001",
    kind: "handwriting_scan",
    description:
      "A scan and handwriting extraction succeeds when expected fragments and confidence thresholds are met.",
    result: createHandwritingScanExtractedResult(),
    expectations: {
      expectedOutcome: "pass",
      expectedExtractionOutcome: "extracted",
      expectedFragments: [
        "handwritten mitochondria note",
        "cellular respiration",
        "ATP energy",
      ],
      minCoverageRatio: 1,
      minAverageConfidence: 0.78,
      requiredProvenanceSources: [
        "scan",
        "handwriting",
      ],
      requiredUnsupportedPageNumbers: [],
      requiredFailureCodes: [],
      requireWarning: false,
      requirePageFailure: false,
    },
  },
  {
    caseId: "resource-extraction-quality-unsupported-page-honesty-001",
    kind: "unsupported_page_honesty",
    description:
      "An unsupported page is represented honestly through partial extraction warning and page failure semantics.",
    result: createUnsupportedPageHonestResult(),
    expectations: {
      expectedOutcome: "pass",
      expectedExtractionOutcome: "partially_extracted",
      expectedFragments: [
        "supported first page",
      ],
      minCoverageRatio: 1,
      minAverageConfidence: 0.8,
      requiredProvenanceSources: [
        "document_text",
      ],
      requiredUnsupportedPageNumbers: [
        3,
      ],
      requiredFailureCodes: [
        "unsupported_page",
      ],
      requireWarning: true,
      requirePageFailure: true,
    },
  },
  {
    caseId: "resource-extraction-quality-low-coverage-001",
    kind: "coverage",
    description:
      "A low-coverage extraction misses required synthetic fragments and must fail the quality gate.",
    result: createLowCoverageExtractedResult(),
    expectations: {
      expectedOutcome: "fail",
      expectedExtractionOutcome: "extracted",
      expectedFragments: [
        "photosynthesis converts light energy",
        "chlorophyll absorbs blue and red light",
        "glucose stores chemical energy",
      ],
      minCoverageRatio: 0.9,
      minAverageConfidence: 0.75,
      requiredProvenanceSources: [
        "document_text",
      ],
      requiredUnsupportedPageNumbers: [],
      requiredFailureCodes: [],
      requireWarning: false,
      requirePageFailure: false,
    },
  },
  {
    caseId: "resource-extraction-quality-terminal-failure-001",
    kind: "failure_correctness",
    description:
      "A terminal extractor failure is accepted only when it is represented as a failed extraction with an explicit failure code.",
    result: createTerminalFailureResult(),
    expectations: {
      expectedOutcome: "pass",
      expectedExtractionOutcome: "failed",
      expectedFragments: [],
      minCoverageRatio: 1,
      minAverageConfidence: 0,
      requiredProvenanceSources: [],
      requiredUnsupportedPageNumbers: [],
      requiredFailureCodes: [
        "extractor_failed",
      ],
      requireWarning: false,
      requirePageFailure: false,
    },
  },
] as const satisfies readonly ResourceExtractionQualityEvalCase[];

function createCoveredExtractedResult(): SyntheticResourceExtractionResult {
  const extractionDocumentId = createExtractionDocumentId("101");
  const documentProvenance = createProvenance({
    provenanceId: "201",
    source: "document_text",
  });
  const pageProvenance = createProvenance({
    provenanceId: "202",
    source: "document_text",
  });
  const blocks = [
    createBlock({
      blockId: "301",
      kind: "heading",
      text: "Synthetic Graph Notes",
      confidence: 0.98,
      sortOrder: 0,
      pageNumber: 1,
      label: "Page 1 heading",
    }),
    createBlock({
      blockId: "302",
      kind: "paragraph",
      text: "A graph is represented synthetically as vertices and edges for validation.",
      confidence: 0.96,
      sortOrder: 1,
      pageNumber: 1,
      label: "Page 1 paragraph",
    }),
    createBlock({
      blockId: "303",
      kind: "list",
      text: "Vertex; Edge; Path",
      confidence: 0.94,
      sortOrder: 2,
      pageNumber: 1,
      label: "Page 1 list",
    }),
  ] as const;

  return createExtractedResult({
    extractionDocumentId,
    documentProvenance,
    pages: [
      createPage({
        pageId: "401",
        pageNumber: 1,
        text: "Synthetic Graph Notes. A graph is represented synthetically as vertices and edges for validation. Vertex; Edge; Path.",
        confidence: 0.96,
        provenance: pageProvenance,
        failure: null,
      }),
    ],
    blocks,
  });
}

function createPartiallyExtractedResult(): SyntheticResourceExtractionResult {
  const extractionDocumentId = createExtractionDocumentId("102");
  const unsupportedFailure = createUnsupportedPageFailure({
    failureId: "501",
    pageNumber: 2,
    message: "Page 2 uses an unsupported embedded object and was skipped.",
  });
  const documentProvenance = createProvenance({
    provenanceId: "203",
    source: "document_text",
  });
  const pageOneProvenance = createProvenance({
    provenanceId: "204",
    source: "document_text",
  });
  const pageTwoProvenance = createProvenance({
    provenanceId: "205",
    source: "document_text",
  });
  const blocks = [
    createBlock({
      blockId: "304",
      kind: "paragraph",
      text: "Readable page content includes a valid extracted formula.",
      confidence: 0.88,
      sortOrder: 0,
      pageNumber: 1,
      label: "Readable page paragraph",
    }),
  ] as const;

  return {
    outcome: "partially_extracted",
    document: createDocument({
      extractionDocumentId,
      status: "partially_extracted",
      blocks,
    }),
    content: createContent({
      extractionDocumentId,
      blocks,
      provenance: documentProvenance,
      pages: [
        createPage({
          pageId: "402",
          pageNumber: 1,
          text: "Readable page content includes a valid extracted formula.",
          confidence: 0.88,
          provenance: pageOneProvenance,
          failure: null,
        }),
        createPage({
          pageId: "403",
          pageNumber: 2,
          text: "Unsupported page was skipped.",
          confidence: null,
          provenance: pageTwoProvenance,
          failure: unsupportedFailure,
        }),
      ],
    }),
    warning: unsupportedFailure,
  };
}

function createHandwritingScanExtractedResult(): SyntheticResourceExtractionResult {
  const extractionDocumentId = createExtractionDocumentId("103");
  const documentProvenance = createProvenance({
    provenanceId: "206",
    source: "scan",
  });
  const pageProvenance = createProvenance({
    provenanceId: "207",
    source: "handwriting",
  });
  const blocks = [
    createBlock({
      blockId: "305",
      kind: "paragraph",
      text: "The handwritten mitochondria note says cellular respiration produces ATP energy.",
      confidence: 0.82,
      sortOrder: 0,
      pageNumber: 1,
      label: "Handwritten scan paragraph",
    }),
  ] as const;

  return createExtractedResult({
    extractionDocumentId,
    documentProvenance,
    pages: [
      createPage({
        pageId: "404",
        pageNumber: 1,
        text: "The handwritten mitochondria note says cellular respiration produces ATP energy.",
        confidence: 0.82,
        provenance: pageProvenance,
        failure: null,
      }),
    ],
    blocks,
  });
}

function createUnsupportedPageHonestResult(): SyntheticResourceExtractionResult {
  const extractionDocumentId = createExtractionDocumentId("104");
  const unsupportedFailure = createUnsupportedPageFailure({
    failureId: "502",
    pageNumber: 3,
    message: "Page 3 has an unsupported encrypted page payload.",
  });
  const documentProvenance = createProvenance({
    provenanceId: "208",
    source: "document_text",
  });
  const supportedPageProvenance = createProvenance({
    provenanceId: "209",
    source: "document_text",
  });
  const unsupportedPageProvenance = createProvenance({
    provenanceId: "210",
    source: "document_text",
  });
  const blocks = [
    createBlock({
      blockId: "306",
      kind: "paragraph",
      text: "The supported first page was extracted successfully.",
      confidence: 0.9,
      sortOrder: 0,
      pageNumber: 1,
      label: "Supported first page paragraph",
    }),
  ] as const;

  return {
    outcome: "partially_extracted",
    document: createDocument({
      extractionDocumentId,
      status: "partially_extracted",
      blocks,
    }),
    content: createContent({
      extractionDocumentId,
      blocks,
      provenance: documentProvenance,
      pages: [
        createPage({
          pageId: "405",
          pageNumber: 1,
          text: "The supported first page was extracted successfully.",
          confidence: 0.9,
          provenance: supportedPageProvenance,
          failure: null,
        }),
        createPage({
          pageId: "406",
          pageNumber: 3,
          text: "Unsupported encrypted page payload.",
          confidence: null,
          provenance: unsupportedPageProvenance,
          failure: unsupportedFailure,
        }),
      ],
    }),
    warning: unsupportedFailure,
  };
}

function createLowCoverageExtractedResult(): SyntheticResourceExtractionResult {
  const extractionDocumentId = createExtractionDocumentId("105");
  const documentProvenance = createProvenance({
    provenanceId: "211",
    source: "document_text",
  });
  const pageProvenance = createProvenance({
    provenanceId: "212",
    source: "document_text",
  });
  const blocks = [
    createBlock({
      blockId: "307",
      kind: "paragraph",
      text: "Photosynthesis was mentioned briefly.",
      confidence: 0.92,
      sortOrder: 0,
      pageNumber: 1,
      label: "Low coverage paragraph",
    }),
  ] as const;

  return createExtractedResult({
    extractionDocumentId,
    documentProvenance,
    pages: [
      createPage({
        pageId: "407",
        pageNumber: 1,
        text: "Photosynthesis was mentioned briefly.",
        confidence: 0.92,
        provenance: pageProvenance,
        failure: null,
      }),
    ],
    blocks,
  });
}

function createTerminalFailureResult(): SyntheticResourceExtractionResult {
  return {
    outcome: "failed",
    failure: {
      failureId: "00000000-0000-4000-8000-000000010503",
      code: "extractor_failed",
      message: "Synthetic extractor failure for quality-gate validation.",
    },
  };
}

function createExtractedResult(
  input: Readonly<{
    extractionDocumentId: string;
    documentProvenance: SyntheticExtractionProvenance;
    pages: readonly SyntheticExtractedPage[];
    blocks: readonly SyntheticExtractedContentBlock[];
  }>,
): SyntheticResourceExtractionResult {
  return {
    outcome: "extracted",
    document: createDocument({
      extractionDocumentId: input.extractionDocumentId,
      status: "extracted",
      blocks: input.blocks,
    }),
    content: createContent({
      extractionDocumentId: input.extractionDocumentId,
      pages: input.pages,
      blocks: input.blocks,
      provenance: input.documentProvenance,
    }),
  };
}

function createDocument(
  input: Readonly<{
    extractionDocumentId: string;
    status: SyntheticExtractionDocument["status"];
    blocks: readonly SyntheticExtractedContentBlock[];
  }>,
): SyntheticExtractionDocument {
  return {
    extractionDocumentId: input.extractionDocumentId,
    studentId: syntheticStudentId,
    resourceId: syntheticResourceId,
    status: input.status,
    extractionStrategyVersion,
    chunkingStrategyVersion,
    extractedAt,
    blocks: input.blocks,
  };
}

function createContent(
  input: Readonly<{
    extractionDocumentId: string;
    pages: readonly SyntheticExtractedPage[];
    blocks: readonly SyntheticExtractedContentBlock[];
    provenance: SyntheticExtractionProvenance;
  }>,
): SyntheticExtractedResourceContent {
  return {
    extractionDocumentId: input.extractionDocumentId,
    studentId: syntheticStudentId,
    resourceId: syntheticResourceId,
    extractionStrategyVersion,
    chunkingStrategyVersion,
    pages: input.pages,
    blocks: input.blocks,
    provenance: input.provenance,
    extractedAt,
  };
}

function createPage(
  input: Readonly<{
    pageId: string;
    pageNumber: number;
    text: string;
    confidence: number | null;
    provenance: SyntheticExtractionProvenance;
    failure: SyntheticUnsupportedPageExtractionFailure | null;
  }>,
): SyntheticExtractedPage {
  return {
    pageId: `00000000-0000-4000-8000-000000010${input.pageId}`,
    pageNumber: input.pageNumber,
    text: input.text,
    locator: createLocator({
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
    kind: SyntheticExtractedContentBlock["kind"];
    text: string;
    confidence: number | null;
    sortOrder: number;
    pageNumber: number;
    label: string;
  }>,
): SyntheticExtractedContentBlock {
  return {
    blockId: `00000000-0000-4000-8000-000000010${input.blockId}`,
    kind: input.kind,
    text: input.text,
    locator: createLocator({
      pageNumber: input.pageNumber,
      label: input.label,
    }),
    sortOrder: input.sortOrder,
    parentBlockId: null,
    confidence: input.confidence,
  };
}

function createProvenance(
  input: Readonly<{
    provenanceId: string;
    source: SyntheticExtractionProvenanceSource;
  }>,
): SyntheticExtractionProvenance {
  return {
    provenanceId: `00000000-0000-4000-8000-000000010${input.provenanceId}`,
    source: input.source,
    strategyVersion: extractionStrategyVersion,
    extractedAt,
    notes: "Synthetic extraction quality eval fixture.",
  };
}

function createUnsupportedPageFailure(
  input: Readonly<{
    failureId: string;
    pageNumber: number;
    message: string;
  }>,
): SyntheticUnsupportedPageExtractionFailure {
  return {
    failureId: `00000000-0000-4000-8000-000000010${input.failureId}`,
    code: "unsupported_page",
    message: input.message,
    pageNumber: input.pageNumber,
  };
}

function createExtractionDocumentId(suffix: string): string {
  return `00000000-0000-4000-8000-000000010${suffix}`;
}

function createLocator(
  input: Readonly<{
    pageNumber: number;
    label: string;
  }>,
): SyntheticResourceSourceLocator {
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