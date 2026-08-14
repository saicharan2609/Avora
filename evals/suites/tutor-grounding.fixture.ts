import {
  createGroundedContextEnvelope,
} from "@avora/ai";
import type {
  Citation,
  GroundedAnswer,
  GroundedContextEnvelope,
  TutorAnswerCandidate,
  TutorGatewayResponse,
  TutorQuery,
} from "@avora/ai";
import type {
  createTutorGateway,
} from "@avora/ai";

type TutorGatewayInput = Parameters<typeof createTutorGateway>[0];
type RetrievalSearchPort = TutorGatewayInput["retrievalSearch"];
type ScopedSearchResult = Awaited<ReturnType<RetrievalSearchPort["search"]>>;
type RetrievalSearchResult = ScopedSearchResult["results"][number];
type SyntheticChunkRecord = RetrievalSearchResult["chunk"];

export type TutorGroundingExpectedOutcome = "pass" | "fail";

export type TutorGroundingEvalCaseKind =
  | "grounding_fidelity"
  | "citation_validity"
  | "insufficiency_honesty"
  | "unresolved_citation";

export type TutorGroundingEvalCase = Readonly<{
  caseId: string;
  kind: TutorGroundingEvalCaseKind;
  description: string;
  expectedOutcome: TutorGroundingExpectedOutcome;
}>;

export const tutorGroundingEvalCases = [
  {
    caseId: "tutor-grounding-valid-answer-001",
    kind: "grounding_fidelity",
    description:
      "Grounded tutor answer uses supplied retrieval evidence and valid citations.",
    expectedOutcome: "pass",
  },
  {
    caseId: "tutor-grounding-unsupported-content-001",
    kind: "grounding_fidelity",
    description:
      "Tutor answer includes unsupported facts that do not appear in supplied evidence.",
    expectedOutcome: "fail",
  },
  {
    caseId: "tutor-citation-valid-001",
    kind: "citation_validity",
    description:
      "Grounded answer citations resolve to chunks in the grounded context envelope.",
    expectedOutcome: "pass",
  },
  {
    caseId: "tutor-citation-unresolved-001",
    kind: "citation_validity",
    description:
      "Grounded answer contains a citation whose chunk id was not supplied in evidence.",
    expectedOutcome: "fail",
  },
  {
    caseId: "tutor-insufficiency-honest-001",
    kind: "insufficiency_honesty",
    description:
      "Insufficient retrieval context returns honest insufficiency without invoking answer generation.",
    expectedOutcome: "pass",
  },
  {
    caseId: "tutor-insufficiency-dishonest-answer-001",
    kind: "insufficiency_honesty",
    description:
      "Insufficient retrieval context is incorrectly presented as a grounded answer.",
    expectedOutcome: "fail",
  },
  {
    caseId: "tutor-api-unresolved-citation-001",
    kind: "unresolved_citation",
    description:
      "Tutor response presented as grounded includes an unresolved citation and must fail closed.",
    expectedOutcome: "pass",
  },
] as const satisfies readonly TutorGroundingEvalCase[];

export const tutorGroundingStudentId =
  "00000000-0000-4000-8000-0000000110a1" as TutorQuery["studentId"];

export const tutorGroundingResourceId =
  "00000000-0000-4000-8000-000000011101" as SyntheticChunkRecord["resourceId"];

export const tutorGroundingChunkId =
  "00000000-0000-4000-8000-000000011201" as SyntheticChunkRecord["chunkId"];

export const tutorGroundingUnknownChunkId =
  "00000000-0000-4000-8000-000000011299" as SyntheticChunkRecord["chunkId"];

export const tutorGroundingCitationId =
  "00000000-0000-4000-8000-000000011301" as Citation["citationId"];

export const tutorGroundingUnknownCitationId =
  "00000000-0000-4000-8000-000000011399" as Citation["citationId"];

export const tutorGroundingAnswerMessageId =
  "00000000-0000-4000-8000-000000011401" as GroundedAnswer["answerMessageId"];

export const tutorGroundingCreatedAt =
  "2026-08-14T03:30:00.000Z" as GroundedAnswer["createdAt"];

export const tutorGroundingQuestion =
  "What does the synthetic graph note say about graph representation?";

export const tutorGroundingEvidenceText =
  "A graph is represented synthetically as vertices and edges for validation.";

export const tutorGroundingUnsupportedText =
  "Dijkstra always works with negative-weight edges in this synthetic note.";

export const tutorGroundingValidAnswerText =
  "The supplied note says a graph is represented synthetically as vertices and edges for validation.";

export const tutorGroundingValidQuote =
  "A graph is represented synthetically as vertices and edges";

export function createSyntheticTutorQuery(): TutorQuery {
  return {
    studentId: tutorGroundingStudentId,
    conversationId: null,
    messageId: "00000000-0000-4000-8000-000000011402" as TutorQuery["messageId"],
    question: tutorGroundingQuestion,
    scope: {
      termId: "00000000-0000-4000-8000-000000011501",
      subjectId: "00000000-0000-4000-8000-000000011502",
      structureUnitId: "00000000-0000-4000-8000-000000011503",
      resourceId: tutorGroundingResourceId,
    },
    depth: "standard",
    answerFormat: "explanation",
    language: "en",
    createdAt: tutorGroundingCreatedAt,
  };
}

export function createSyntheticChunkRecord(): SyntheticChunkRecord {
  return {
    chunkId: tutorGroundingChunkId,
    studentId: tutorGroundingStudentId,
    resourceId: tutorGroundingResourceId,
    extractionDocumentId:
      "00000000-0000-4000-8000-000000011601" as SyntheticChunkRecord["extractionDocumentId"],
    sourceBlockIds: [
  "00000000-0000-4000-8000-000000011701" as SyntheticChunkRecord["sourceBlockIds"][number],
],
    scope: {
      termId: "00000000-0000-4000-8000-000000011501",
      subjectId: "00000000-0000-4000-8000-000000011502",
      structureUnitId: "00000000-0000-4000-8000-000000011503",
      resourceId: tutorGroundingResourceId,
    },
    contentKind: "paragraph",
    text: tutorGroundingEvidenceText,
    tokenEstimate: 16,
    sanitisation: {
      status: "sanitised",
      strategyVersion: "sanitiser.v1" as SyntheticChunkRecord["sanitisation"]["strategyVersion"],
      warnings: [],
    },
    locator: {
      kind: "document_page",
      pageNumber: 2,
      slideNumber: null,
      boundingBox: {
        x: 0.1,
        y: 0.2,
        width: 0.8,
        height: 0.15,
        unit: "ratio",
      },
      textSpan: {
        startOffset: 0,
        endOffset: tutorGroundingEvidenceText.length,
      },
      timeRange: null,
      label: "Synthetic page 2 graph definition",
    },
    sourceContentHash:
      "sha256:stage11tutorgroundingfixture0000000000000000000000000000000000000000000001",
    chunkingStrategyVersion:
      "chunker.v1" as SyntheticChunkRecord["chunkingStrategyVersion"],
    status: "ready",
    sortOrder: 0,
    createdAt: tutorGroundingCreatedAt,
    updatedAt: tutorGroundingCreatedAt,
  };
}

export function createSufficientScopedSearchResult(): ScopedSearchResult {
  return {
    input: {
      studentId: tutorGroundingStudentId,
      query: tutorGroundingQuestion,
      scope: createSyntheticTutorQuery().scope,
      limits: {
        maxChunks: 4,
      },
      insufficiency: {
        minChunkCount: 1,
      },
    },
    results: [
      {
        rank: 1,
        chunk: createSyntheticChunkRecord(),
      },
    ],
    sufficiency: {
      insufficient: false,
      studentId: tutorGroundingStudentId,
      query: tutorGroundingQuestion,
      scope: createSyntheticTutorQuery().scope,
      availableChunkCount: 1,
    },
  };
}

export function createInsufficientScopedSearchResult(): ScopedSearchResult {
  return {
    input: {
      studentId: tutorGroundingStudentId,
      query: tutorGroundingQuestion,
      scope: createSyntheticTutorQuery().scope,
      limits: {
        maxChunks: 4,
      },
      insufficiency: {
        minChunkCount: 1,
      },
    },
    results: [],
    sufficiency: {
      insufficient: true,
      reason: "no_scoped_context",
      studentId: tutorGroundingStudentId,
      query: tutorGroundingQuestion,
      scope: createSyntheticTutorQuery().scope,
      availableChunkCount: 0,
      requiredChunkCount: 1,
    },
  };
}

export function createGroundedContextFixture(): GroundedContextEnvelope {
  return createGroundedContextEnvelope({
    query: createSyntheticTutorQuery(),
    scopedSearchResult: createSufficientScopedSearchResult(),
  });
}

export function createValidCitationFixture(): Citation {
  return {
    citationId: tutorGroundingCitationId,
    chunkId: tutorGroundingChunkId,
    resourceId: tutorGroundingResourceId,
    locator: createSyntheticChunkRecord().locator,
    quote: tutorGroundingValidQuote,
  };
}

export function createUnresolvedCitationFixture(): Citation {
  return {
    citationId: tutorGroundingUnknownCitationId,
    chunkId: tutorGroundingUnknownChunkId,
    resourceId: tutorGroundingResourceId,
    locator: createSyntheticChunkRecord().locator,
    quote: tutorGroundingValidQuote,
  };
}

export function createValidTutorAnswerCandidate(): TutorAnswerCandidate {
  return {
    answerMessageId: tutorGroundingAnswerMessageId,
    answerText: tutorGroundingValidAnswerText,
    citations: [
      createValidCitationFixture(),
    ],
    createdAt: tutorGroundingCreatedAt,
  };
}

export function createUnsupportedTutorAnswerCandidate(): TutorAnswerCandidate {
  return {
    answerMessageId: tutorGroundingAnswerMessageId,
    answerText: `${tutorGroundingValidAnswerText} ${tutorGroundingUnsupportedText}`,
    citations: [
      createValidCitationFixture(),
    ],
    createdAt: tutorGroundingCreatedAt,
  };
}

export function createUnresolvedCitationTutorAnswerCandidate(): TutorAnswerCandidate {
  return {
    answerMessageId: tutorGroundingAnswerMessageId,
    answerText: tutorGroundingValidAnswerText,
    citations: [
      createUnresolvedCitationFixture(),
    ],
    createdAt: tutorGroundingCreatedAt,
  };
}

export function createGroundedAnswerFixture(
  candidate: TutorAnswerCandidate,
): GroundedAnswer {
  return {
    status: "answered",
    answerMessageId: candidate.answerMessageId,
    query: createSyntheticTutorQuery(),
    context: createGroundedContextFixture(),
    answerText: candidate.answerText,
    citations: candidate.citations,
    createdAt: candidate.createdAt,
  };
}

export function createDishonestInsufficientContextResponse(): TutorGatewayResponse {
  return createGroundedAnswerFixture(createValidTutorAnswerCandidate());
}