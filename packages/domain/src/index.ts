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