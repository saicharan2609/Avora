import type {
  ResourceId,
  StudentId,
} from "@avora/core/identity";

import type {
  PlacementCandidate,
  PlacementCorrection,
  ResourcePlacement,
  ResourcePlacementId,
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

export type RecordPlacementCorrectionInput = Readonly<{
  correction: PlacementCorrection;
}>;

export type ListPlacementCorrectionsByResourceInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
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
  recordCorrection: (
    input: RecordPlacementCorrectionInput,
  ) => Promise<PlacementCorrection>;
  listCorrectionsByResource: (
    input: ListPlacementCorrectionsByResourceInput,
  ) => Promise<readonly PlacementCorrection[]>;
}>;