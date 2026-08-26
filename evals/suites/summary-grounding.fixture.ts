import type {
  GeneratedSummary,
  GroundedSummaryContextEnvelope,
  SummaryCandidate,
  SummaryCitation,
  SummaryQuery,
} from "@avora/ai";
import {
  createGroundedSummaryContextEnvelope,
} from "@avora/ai";
import type {
  createSummaryGateway,
} from "@avora/ai";

type SummaryGatewayInput = Parameters<typeof createSummaryGateway>[0];
type ChunkRetrievalPort = SummaryGatewayInput["chunkRetrieval"];
type SyntheticChunkRecord = Awaited<
  ReturnType<ChunkRetrievalPort["listRetrievalChunksByResource"]>
>[number];

export type SummaryGroundingExpectedOutcome = "pass" | "fail";

export type SummaryGroundingEvalCaseKind =
  | "groundedness"
  | "coherence_structure"
  | "citation_validity"
  | "citation_locality"
  | "unsupported_claim_rejection"
  | "fail_closed";

export type SummaryGroundingEvalCase = Readonly<{
  caseId: string;
  kind: SummaryGroundingEvalCaseKind;
  description: string;
  expectedOutcome: SummaryGroundingExpectedOutcome;
}>;

export const summaryGroundingEvalCases = [
  {
    caseId: "summary-groundedness-valid-001",
    kind: "groundedness",
    description:
      "Generated summary points are directly supported by the supplied resource evidence.",
    expectedOutcome: "pass",
  },
  {
    caseId: "summary-groundedness-unsupported-001",
    kind: "unsupported_claim_rejection",
    description:
      "Generated summary includes a point not present anywhere in the supplied resource evidence.",
    expectedOutcome: "fail",
  },
  {
    caseId: "summary-single-chunk-sufficiency-001",
    kind: "groundedness",
    description:
      "Multiple chunks were supplied for the resource, but the generated summary is fully grounded and validly cited using only one of them. The governing requirement is citation validity and locality, not exhaustive coverage of every supplied chunk, so this must be accepted.",
    expectedOutcome: "pass",
  },
  {
    caseId: "summary-coherence-structure-001",
    kind: "coherence_structure",
    description:
      "Generated summary has at least one heading with a non-empty title and at least one point.",
    expectedOutcome: "pass",
  },
  {
    caseId: "summary-coherence-structure-empty-heading-001",
    kind: "coherence_structure",
    description:
      "Generated summary has a heading with an empty title, violating the structural output contract.",
    expectedOutcome: "fail",
  },
  {
    caseId: "summary-citation-valid-001",
    kind: "citation_validity",
    description:
      "Summary citations resolve to chunks in the grounded summary context envelope.",
    expectedOutcome: "pass",
  },
  {
    caseId: "summary-citation-unresolved-001",
    kind: "citation_validity",
    description:
      "Summary contains a citation whose chunk id was not supplied in evidence.",
    expectedOutcome: "fail",
  },
  {
    caseId: "summary-citation-locality-other-resource-001",
    kind: "citation_locality",
    description:
      "Summary cites a chunk id that belongs to a different resource than the one being summarised; the envelope for this resource never contains it, so it resolves identically to an unknown chunk.",
    expectedOutcome: "fail",
  },
  {
    caseId: "summary-fail-closed-no-chunks-001",
    kind: "fail_closed",
    description:
      "Resource has zero ready chunks; the gateway must return insufficient_evidence without invoking the provider.",
    expectedOutcome: "pass",
  },
] as const satisfies readonly SummaryGroundingEvalCase[];

export const summaryGroundingStudentId =
  "00000000-0000-4000-8000-0000000210a1" as SummaryQuery["studentId"];

export const summaryGroundingResourceId =
  "00000000-0000-4000-8000-000000021101" as SyntheticChunkRecord["resourceId"];

export const summaryGroundingOtherResourceId =
  "00000000-0000-4000-8000-000000021102" as SyntheticChunkRecord["resourceId"];

export const summaryGroundingChunkId =
  "00000000-0000-4000-8000-000000021201" as SyntheticChunkRecord["chunkId"];

export const summaryGroundingSecondChunkId =
  "00000000-0000-4000-8000-000000021202" as SyntheticChunkRecord["chunkId"];

export const summaryGroundingUnknownChunkId =
  "00000000-0000-4000-8000-000000021299" as SyntheticChunkRecord["chunkId"];

export const summaryGroundingOtherResourceChunkId =
  "00000000-0000-4000-8000-000000021203" as SyntheticChunkRecord["chunkId"];

export const summaryGroundingCitationId =
  "00000000-0000-4000-8000-000000021301" as SummaryCitation["citationId"];

export const summaryGroundingCreatedAt =
  "2026-08-26T03:30:00.000Z" as GeneratedSummary["createdAt"];

export const summaryGroundingEvidenceTextOne =
  "A linked list is a sequence of nodes, each pointing to the next node.";

export const summaryGroundingEvidenceTextTwo =
  "Inserting at the head of a linked list is a constant-time operation.";

export const summaryGroundingUnsupportedText =
  "Linked lists provide constant-time random access to any element.";

export function createSyntheticSummaryQuery(): SummaryQuery {
  return {
    studentId: summaryGroundingStudentId,
    resourceId: summaryGroundingResourceId,
    promptVersion: "summary-system-policy.v1",
    summaryStrategyVersion: "summary.generate.v1",
    requestedAt: summaryGroundingCreatedAt,
  };
}

export function createSyntheticChunkRecord(
  overrides: Readonly<{
    chunkId?: SyntheticChunkRecord["chunkId"];
    resourceId?: SyntheticChunkRecord["resourceId"];
    text?: string;
    sortOrder?: number;
  }> = {},
): SyntheticChunkRecord {
  const text = overrides.text ?? summaryGroundingEvidenceTextOne;

  return {
    chunkId: overrides.chunkId ?? summaryGroundingChunkId,
    studentId: summaryGroundingStudentId,
    resourceId: overrides.resourceId ?? summaryGroundingResourceId,
    extractionDocumentId:
      "00000000-0000-4000-8000-000000021601" as SyntheticChunkRecord["extractionDocumentId"],
    sourceBlockIds: [
      "00000000-0000-4000-8000-000000021701" as SyntheticChunkRecord["sourceBlockIds"][number],
    ],
    scope: {
      termId: "00000000-0000-4000-8000-000000021501",
      subjectId: "00000000-0000-4000-8000-000000021502",
      structureUnitId: "00000000-0000-4000-8000-000000021503",
      resourceId: overrides.resourceId ?? summaryGroundingResourceId,
    },
    contentKind: "paragraph",
    text,
    tokenEstimate: 16,
    sanitisation: {
      status: "sanitised",
      strategyVersion: "sanitiser.v1" as SyntheticChunkRecord["sanitisation"]["strategyVersion"],
      warnings: [],
    },
    locator: {
      kind: "document_page",
      pageNumber: 1,
      slideNumber: null,
      boundingBox: null,
      textSpan: {
        startOffset: 0,
        endOffset: text.length,
      },
      timeRange: null,
      label: "Synthetic summary fixture page",
    },
    sourceContentHash:
      "sha256:stage12group7summarygroundingfixture000000000000000000000000000001",
    chunkingStrategyVersion:
      "chunker.v1" as SyntheticChunkRecord["chunkingStrategyVersion"],
    status: "ready",
    sortOrder: overrides.sortOrder ?? 0,
    createdAt: summaryGroundingCreatedAt,
    updatedAt: summaryGroundingCreatedAt,
  };
}

export function createSingleChunkFixture(): readonly SyntheticChunkRecord[] {
  return [createSyntheticChunkRecord()];
}

export function createTwoChunkFixture(): readonly SyntheticChunkRecord[] {
  return [
    createSyntheticChunkRecord({ sortOrder: 0 }),
    createSyntheticChunkRecord({
      chunkId: summaryGroundingSecondChunkId,
      text: summaryGroundingEvidenceTextTwo,
      sortOrder: 1,
    }),
  ];
}

export function createGroundedSummaryContextFixture(
  chunks: readonly SyntheticChunkRecord[] = createSingleChunkFixture(),
): GroundedSummaryContextEnvelope {
  return createGroundedSummaryContextEnvelope({
    query: createSyntheticSummaryQuery(),
    chunks,
  });
}

export const summaryGroundingModelVersion = "gemini-3.6-flash";

export function createValidSummaryCandidate(): SummaryCandidate {
  return {
    body: {
      headings: [
        {
          title: "Linked Lists",
          points: [summaryGroundingEvidenceTextOne],
        },
      ],
    },
    citations: [
      {
        citationId: summaryGroundingCitationId,
        chunkId: summaryGroundingChunkId,
        resourceId: summaryGroundingResourceId,
        locator: createSyntheticChunkRecord().locator,
        quote: summaryGroundingEvidenceTextOne,
      },
    ],
    modelVersion: summaryGroundingModelVersion,
    createdAt: summaryGroundingCreatedAt,
  };
}

export function createUnsupportedSummaryCandidate(): SummaryCandidate {
  return {
    body: {
      headings: [
        {
          title: "Linked Lists",
          points: [summaryGroundingUnsupportedText],
        },
      ],
    },
    citations: [
      {
        citationId: summaryGroundingCitationId,
        chunkId: summaryGroundingChunkId,
        resourceId: summaryGroundingResourceId,
        locator: createSyntheticChunkRecord().locator,
        quote: summaryGroundingEvidenceTextOne,
      },
    ],
    modelVersion: summaryGroundingModelVersion,
    createdAt: summaryGroundingCreatedAt,
  };
}

// Deliberately cites only one of the (potentially several) supplied chunks.
// The governing requirement is citation validity/locality, not exhaustive
// coverage of every supplied chunk — a summary fully grounded in a single
// chunk must be accepted even when the resource has more indexed content
// (summary-single-chunk-sufficiency-001).
export function createSingleChunkSufficientSummaryCandidate(): SummaryCandidate {
  return createValidSummaryCandidate();
}

export function createEmptyHeadingTitleSummaryCandidate(): SummaryCandidate {
  return {
    body: {
      headings: [
        {
          title: "",
          points: [summaryGroundingEvidenceTextOne],
        },
      ],
    },
    citations: createValidSummaryCandidate().citations,
    modelVersion: summaryGroundingModelVersion,
    createdAt: summaryGroundingCreatedAt,
  };
}

export function createUnresolvedCitationSummaryCandidate(): SummaryCandidate {
  return {
    body: createValidSummaryCandidate().body,
    citations: [
      {
        citationId: summaryGroundingCitationId,
        chunkId: summaryGroundingUnknownChunkId,
        resourceId: summaryGroundingResourceId,
        locator: createSyntheticChunkRecord().locator,
        quote: summaryGroundingEvidenceTextOne,
      },
    ],
    modelVersion: summaryGroundingModelVersion,
    createdAt: summaryGroundingCreatedAt,
  };
}

export function createOtherResourceCitationSummaryCandidate(): SummaryCandidate {
  return {
    body: createValidSummaryCandidate().body,
    citations: [
      {
        citationId: summaryGroundingCitationId,
        chunkId: summaryGroundingOtherResourceChunkId,
        resourceId: summaryGroundingOtherResourceId,
        locator: createSyntheticChunkRecord().locator,
        quote: summaryGroundingEvidenceTextOne,
      },
    ],
    modelVersion: summaryGroundingModelVersion,
    createdAt: summaryGroundingCreatedAt,
  };
}
