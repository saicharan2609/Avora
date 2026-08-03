export type EvaluationChunk = Readonly<{
  chunkId: string;
  resourceId: string;
  locator: string;
}>;

export type EvaluationCitation = Readonly<{
  citationId: string;
  chunkId: string;
}>;

export type CitationValidityCase = Readonly<{
  caseId: string;
  suppliedChunks: readonly EvaluationChunk[];
  emittedCitations: readonly EvaluationCitation[];
  expectedOutcome: "deliver" | "block";
}>;

export const citationValidityCases = [
  {
    caseId: "citation-validity-deliver-001",
    suppliedChunks: [
      {
        chunkId: "chunk-grounded-001",
        resourceId: "resource-grounded-001",
        locator: "page 2",
      },
    ],
    emittedCitations: [
      {
        citationId: "citation-grounded-001",
        chunkId: "chunk-grounded-001",
      },
    ],
    expectedOutcome: "deliver",
  },
  {
    caseId: "citation-validity-block-001",
    suppliedChunks: [
      {
        chunkId: "chunk-grounded-002",
        resourceId: "resource-grounded-002",
        locator: "page 4",
      },
    ],
    emittedCitations: [
      {
        citationId: "citation-ungrounded-001",
        chunkId: "chunk-not-supplied-001",
      },
    ],
    expectedOutcome: "block",
  },
] as const satisfies readonly CitationValidityCase[];