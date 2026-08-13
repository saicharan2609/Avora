import type {
  StudentId,
} from "@avora/core/identity";

import type {
  ScopedSearchScope,
} from "../scope/index.js";

export type RetrievalInsufficiencyReason =
  | "no_scoped_context"
  | "insufficient_scoped_context";

export type RetrievalInsufficiency = Readonly<{
  insufficient: true;
  reason: RetrievalInsufficiencyReason;
  studentId: StudentId;
  query: string;
  scope: ScopedSearchScope;
  availableChunkCount: number;
  requiredChunkCount: number;
}>;

export type RetrievalSufficiency = Readonly<{
  insufficient: false;
  studentId: StudentId;
  query: string;
  scope: ScopedSearchScope;
  availableChunkCount: number;
}>;

export type RetrievalSufficiencyDecision =
  | RetrievalInsufficiency
  | RetrievalSufficiency;

export type CreateRetrievalInsufficiencyInput = Readonly<{
  reason: RetrievalInsufficiencyReason;
  studentId: StudentId;
  query: string;
  scope: ScopedSearchScope;
  availableChunkCount: number;
  requiredChunkCount: number;
}>;

export type CreateRetrievalSufficiencyInput = Readonly<{
  studentId: StudentId;
  query: string;
  scope: ScopedSearchScope;
  availableChunkCount: number;
}>;

export function createRetrievalInsufficiency(
  input: CreateRetrievalInsufficiencyInput,
): RetrievalInsufficiency {
  return {
    insufficient: true,
    reason: input.reason,
    studentId: input.studentId,
    query: input.query,
    scope: input.scope,
    availableChunkCount: input.availableChunkCount,
    requiredChunkCount: input.requiredChunkCount,
  };
}

export function createRetrievalSufficiency(
  input: CreateRetrievalSufficiencyInput,
): RetrievalSufficiency {
  return {
    insufficient: false,
    studentId: input.studentId,
    query: input.query,
    scope: input.scope,
    availableChunkCount: input.availableChunkCount,
  };
}