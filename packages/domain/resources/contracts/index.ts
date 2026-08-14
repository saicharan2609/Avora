export type { ResourceKind } from "./ResourceKind.contract.js";
export type { ResourceLifecycleState } from "./ResourceLifecycleState.contract.js";
export type {
  ResourceStorageBucket,
  ResourceStorageLocation,
  ResourceStorageVersion,
} from "./ResourceStorage.contract.js";
export type { ResourceRecord } from "./ResourceRecord.contract.js";
export type {
  CompleteResourceUploadInput,
  CompleteResourceUploadResult,
  DeclareResourceUploadInput,
  DeclareResourceUploadResult,
  ResourceUploadTicket,
} from "./ResourceUpload.contract.js";

export { resourceKinds } from "./ResourceKind.contract.js";
export { resourceLifecycleStates } from "./ResourceLifecycleState.contract.js";
export { resourceStorageBuckets } from "./ResourceStorage.contract.js";
export type {
  ResourceIngestionValidationIssue,
  ResourceIngestionValidationIssueCode,
  ResourceIngestionValidationResult,
} from "./validation/ResourceIngestionValidation.contract.js";

export {
  resourceIngestionValidationIssueCodes,
} from "./validation/ResourceIngestionValidation.contract.js";
export type {
  ResourceBoundingBox,
  ResourceChunkingStrategyVersion,
  ResourceExtractedContentBlock,
  ResourceExtractedContentBlockId,
  ResourceExtractedContentBlockKind,
  ResourceExtractionDocument,
  ResourceExtractionDocumentId,
  ResourceExtractionDocumentStatus,
  ResourceExtractionFailure,
  ResourceExtractionFailureCode,
  ResourceExtractionRequest,
  ResourceExtractionResult,
  ResourceExtractionStrategyVersion,
  ResourceSourceLocator,
  ResourceSourceLocatorKind,
  ResourceTextSpan,
  ResourceTimeRange,
} from "./extraction/index.js";

export {
  resourceExtractedContentBlockKinds,
  resourceExtractionDocumentStatuses,
  resourceExtractionFailureCodes,
  resourceSourceLocatorKinds,
} from "./extraction/index.js";
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
} from "./placement/index.js";
export {
  placementCandidateProvenances,
  resourcePlacementStatuses,
} from "./placement/index.js";