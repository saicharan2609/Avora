import type {
  ResourceId,
  StudentId,
} from "@avora/core/identity";
import type {
  IsoDateTimeString,
} from "@avora/core/time";

import type {
  ResourcePlacementTarget,
} from "./ResourcePlacement.contract.js";

export type PlacementCorrectionId = string & {
  readonly __brand: "PlacementCorrectionId";
};

export type PlacementCorrection = Readonly<{
  correctionId: PlacementCorrectionId;
  studentId: StudentId;
  resourceId: ResourceId;
  previousTarget: ResourcePlacementTarget | null;
  correctedTarget: ResourcePlacementTarget;
  reason: string | null;
  correctedAt: IsoDateTimeString;
}>;