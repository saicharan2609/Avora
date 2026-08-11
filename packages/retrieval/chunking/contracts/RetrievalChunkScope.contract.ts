export const retrievalChunkScopeLevels = [
  "resource",
  "structure_unit",
  "subject",
  "workspace",
] as const;

export type RetrievalChunkScopeLevel =
  (typeof retrievalChunkScopeLevels)[number];

export type RetrievalChunkScopeFacets = Readonly<{
  termId: string | null;
  subjectId: string | null;
  structureUnitId: string | null;
  resourceId: string;
}>;

export type RetrievalChunkScopePredicate = Readonly<{
  studentId: string;
  level: RetrievalChunkScopeLevel;
  chunkIds: readonly string[];
}>;