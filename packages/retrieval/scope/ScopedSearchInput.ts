import type {
  ResourceId,
  StudentId,
} from "@avora/core/identity";
import type {
  ListRetrievalChunksByScopeInput,
} from "@avora/db/repositories/chunks";

export type ScopedSearchScope = Readonly<{
  termId: string | null;
  subjectId: string | null;
  structureUnitId: string | null;
  resourceId: ResourceId | null;
}>;

export type ScopedSearchLimits = Readonly<{
  maxChunks: number;
}>;

export type ScopedSearchInsufficiencyPolicy = Readonly<{
  minChunkCount: number;
}>;

export type ScopedSearchInput = Readonly<{
  studentId: StudentId;
  query: string;
  scope: ScopedSearchScope;
  limits: ScopedSearchLimits;
  insufficiency: ScopedSearchInsufficiencyPolicy;
}>;

export type ResolvedScopedSearchPredicate = ListRetrievalChunksByScopeInput;

export function resolveScopedSearchPredicate(
  input: ScopedSearchInput,
): ResolvedScopedSearchPredicate {
  return {
    studentId: input.studentId,
    termId: input.scope.termId,
    subjectId: input.scope.subjectId,
    structureUnitId: input.scope.structureUnitId,
    resourceId: input.scope.resourceId,
    status: "ready",
  };
}