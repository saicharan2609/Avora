import type {
  ResourceId,
  StudentId,
} from "@avora/core/identity";

import type {
  AcademicStructureTree,
  SubjectId,
} from "../../../academic/index.js";
import type {
  ResourcePlacementTarget,
} from "../placement/ResourcePlacement.contract.js";

export const classificationContentSignalKinds = [
  "heading",
  "content",
] as const;

export type ClassificationContentSignalKind =
  (typeof classificationContentSignalKinds)[number];

export type ClassificationContentSignal = Readonly<{
  kind: ClassificationContentSignalKind;
  text: string;
}>;

export type ClassificationCorrectionSignal = Readonly<{
  correctedTarget: ResourcePlacementTarget;
}>;

// One entry per nearest-neighbor chunk match against the student's existing
// indexed corpus, ranked closest-first (architecture.md 19.4: "Extracted
// content similarity to existing subject corpora — strongest signal once a
// workspace has material"). Computed upstream by the worker via the
// existing, already-approved EmbeddingPort / RetrievalSearchPort seam
// (packages/ai/embeddings, packages/retrieval/search) — this contract only
// carries the resolved subjectId per match, never a vector, never raw
// student content, so the domain service stays pure and dependency-free.
export type ClassificationSimilaritySignal = Readonly<{
  subjectId: SubjectId;
  rank: number;
}>;

export type ClassifyResourceInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  classificationStrategyVersion: string;
  originalFilename: string;
  contentSignals: readonly ClassificationContentSignal[];
  academicStructureTree: AcademicStructureTree;
  correctionHistory: readonly ClassificationCorrectionSignal[];
  similaritySignals: readonly ClassificationSimilaritySignal[];
}>;
