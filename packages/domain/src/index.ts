export type * from "../academic/index.js";

export {
  academicStructureUnitKinds,
  academicTermLifecycleStates,
  placementConfidenceLevels,
  placementConfidenceSources,
  structureUnitSources,
  subjectLifecycleStates,
} from "../academic/index.js";
export {
  academicSetupProgressStatuses,
  AcademicSetupServiceError,
  createAcademicSetupService,
} from "../academic/index.js";
export type {
  ResourceExtractionService,
  ResourceExtractionServiceDependencies,
  ResourceExtractionServiceErrorCode,
} from "../resources/index.js";
export {
  ResourceExtractionServiceError,
  createResourceExtractionService,
} from "../resources/index.js";
export type {
  PlacementCandidate,
  PlacementCandidateId,
  PlacementCandidateProvenance,
  PlacementCorrection,
  PlacementCorrectionId,
  ResourcePlacement,
  ResourcePlacementId,
  ResourcePlacementStatus,
  ResourcePlacementTarget,
  CreatePlacementPolicyInput,
  PlacementPolicy,
  PlacementPolicyDecision,
  PlacementPolicyDecisionKind,
  PlacementPolicyDecisionMap,
} from "../resources/index.js";
export {
  createPlacementPolicy,
  decidePlacementCandidate,
  defaultPlacementPolicy,
  defaultPlacementPolicyDecisionMap,
  placementCandidateProvenances,
  placementPolicyDecisionKinds,
  resourcePlacementStatuses,
} from "../resources/index.js";