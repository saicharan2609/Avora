import type {
  ResourceId,
  StudentId,
} from "@avora/core/identity";
import type {
  IsoDateTimeString,
} from "@avora/core/time";

import type {
  PlacementConfidence,
} from "../../../academic/index.js";
import type {
  ResourcePlacementTarget,
} from "./ResourcePlacement.contract.js";

export type PlacementCandidateId = string & {
  readonly __brand: "PlacementCandidateId";
};

export const placementCandidateProvenances = [
  "resource_metadata",
  "resource_content",
  "student_declared",
  "imported",
] as const;

export type PlacementCandidateProvenance =
  (typeof placementCandidateProvenances)[number];

export type PlacementCandidate = Readonly<{
  candidateId: PlacementCandidateId;
  studentId: StudentId;
  resourceId: ResourceId;
  target: ResourcePlacementTarget;
  confidence: PlacementConfidence;
  provenance: PlacementCandidateProvenance;
  reason: string | null;
  createdAt: IsoDateTimeString;
}>;