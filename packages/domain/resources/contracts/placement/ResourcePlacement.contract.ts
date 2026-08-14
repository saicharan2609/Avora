import type {
  ResourceId,
  StudentId,
} from "@avora/core/identity";
import type {
  IsoDateTimeString,
} from "@avora/core/time";

import type {
  AcademicTermId,
  PlacementConfidence,
  StructureUnitId,
  SubjectId,
} from "../../../academic/index.js";

export type ResourcePlacementId = string & {
  readonly __brand: "ResourcePlacementId";
};

export const resourcePlacementStatuses = [
  "accepted",
  "tentative",
] as const;

export type ResourcePlacementStatus =
  (typeof resourcePlacementStatuses)[number];

export type ResourcePlacementTarget = Readonly<{
  termId: AcademicTermId;
  subjectId: SubjectId;
  structureUnitId: StructureUnitId | null;
}>;

export type ResourcePlacement = Readonly<{
  placementId: ResourcePlacementId;
  studentId: StudentId;
  resourceId: ResourceId;
  target: ResourcePlacementTarget;
  confidence: PlacementConfidence;
  status: ResourcePlacementStatus;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}>;