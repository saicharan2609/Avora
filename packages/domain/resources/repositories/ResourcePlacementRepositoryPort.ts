import type {
  ResourceId,
  StudentId,
} from "@avora/core/identity";

import type {
  PlacementCandidate,
  PlacementCorrection,
  ResourcePlacement,
    PlacementCandidateId,
  ResourcePlacementId,
  ResourcePlacementTarget,
} from "../contracts/index.js";

export type SaveResourcePlacementInput = Readonly<{
  placement: ResourcePlacement;
  candidate: PlacementCandidate | null;
  placementReason: string | null;
}>;

export type GetResourcePlacementByResourceInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
}>;

export type GetResourcePlacementByIdInput = Readonly<{
  studentId: StudentId;
  placementId: ResourcePlacementId;
}>;

export type ReplaceResourcePlacementInput = SaveResourcePlacementInput;
export type GetPlacementCandidateByIdInput = Readonly<{
  studentId: StudentId;
  candidateId: PlacementCandidateId;
}>;

export type ListPlacementCandidatesByResourceInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
}>;
export type RecordPlacementCorrectionInput = Readonly<{
  correction: PlacementCorrection;
}>;

export type ListPlacementCorrectionsByResourceInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
}>;
export type ListResourcePlacementsByAcademicUnitInput = Readonly<{
  studentId: StudentId;
  target: Readonly<{
    termId: ResourcePlacementTarget["termId"];
    subjectId: ResourcePlacementTarget["subjectId"] | null;
    structureUnitId: ResourcePlacementTarget["structureUnitId"];
  }>;
}>;
export type ResourcePlacementRepositoryPort = Readonly<{
  savePlacement: (
    input: SaveResourcePlacementInput,
  ) => Promise<ResourcePlacement>;
  getPlacementByResource: (
    input: GetResourcePlacementByResourceInput,
  ) => Promise<ResourcePlacement | null>;
  getPlacementById: (
    input: GetResourcePlacementByIdInput,
  ) => Promise<ResourcePlacement | null>;
  replacePlacement: (
    input: ReplaceResourcePlacementInput,
  ) => Promise<ResourcePlacement>;
    getPlacementCandidateById: (
    input: GetPlacementCandidateByIdInput,
  ) => Promise<PlacementCandidate | null>;
  listPlacementCandidatesByResource: (
    input: ListPlacementCandidatesByResourceInput,
  ) => Promise<readonly PlacementCandidate[]>;
  recordCorrection: (
    input: RecordPlacementCorrectionInput,
  ) => Promise<PlacementCorrection>;
  listCorrectionsByResource: (
    input: ListPlacementCorrectionsByResourceInput,
  ) => Promise<readonly PlacementCorrection[]>;
    listResourcePlacementsByAcademicUnit: (
    input: ListResourcePlacementsByAcademicUnitInput,
  ) => Promise<readonly ResourcePlacement[]>;
}>;