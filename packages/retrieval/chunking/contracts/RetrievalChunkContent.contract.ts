export const retrievalChunkContentKinds = [
  "heading",
  "paragraph",
  "list",
  "table",
  "formula",
  "code",
  "figure",
  "diagram",
  "transcript",
  "metadata",
  "mixed",
  "unknown",
] as const;

export type RetrievalChunkContentKind =
  (typeof retrievalChunkContentKinds)[number];

export const retrievalChunkSanitisationStatuses = [
  "sanitised",
  "sanitised_with_warnings",
] as const;

export type RetrievalChunkSanitisationStatus =
  (typeof retrievalChunkSanitisationStatuses)[number];

export type RetrievalChunkSanitisation = Readonly<{
  status: RetrievalChunkSanitisationStatus;
  strategyVersion: string;
  warnings: readonly string[];
}>;

export type RetrievalChunkContent = Readonly<{
  kind: RetrievalChunkContentKind;
  text: string;
  tokenEstimate: number;
  sanitisation: RetrievalChunkSanitisation;
}>;