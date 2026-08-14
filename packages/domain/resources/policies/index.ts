export type {
  CreatePlacementPolicyInput,
  PlacementPolicy,
  PlacementPolicyDecision,
  PlacementPolicyDecisionKind,
  PlacementPolicyDecisionMap,
} from "./PlacementPolicy.js";

export {
  createPlacementPolicy,
  decidePlacementCandidate,
  defaultPlacementPolicy,
  defaultPlacementPolicyDecisionMap,
  placementPolicyDecisionKinds,
} from "./PlacementPolicy.js";