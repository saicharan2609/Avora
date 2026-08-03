import type { AdaptivityCase } from "./suite-contract.js";
import { heterogeneousLabelsCase } from "./heterogeneous-labels.case.js";
import { restructurePreservationCase } from "./restructure-preservation.case.js";
import { structureDepthCase } from "./structure-depth.case.js";

export const adaptivityCases: readonly AdaptivityCase[] = [
  structureDepthCase,
  heterogeneousLabelsCase,
  restructurePreservationCase,
];