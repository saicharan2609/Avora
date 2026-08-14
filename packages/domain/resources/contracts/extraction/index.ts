export type {
  ResourceChunkingStrategyVersion,
  ResourceExtractedContentBlockId,
  ResourceExtractionDocumentId,
  ResourceExtractionStrategyVersion,
} from "./ResourceExtractionIdentifiers.contract.js";

export type {
  ResourceBoundingBox,
  ResourceSourceLocator,
  ResourceSourceLocatorKind,
  ResourceTextSpan,
  ResourceTimeRange,
} from "./ResourceSourceLocator.contract.js";
export {
  resourceSourceLocatorKinds,
} from "./ResourceSourceLocator.contract.js";

export type {
  ResourceExtractedContentBlock,
  ResourceExtractedContentBlockKind,
} from "./ResourceExtractedContent.contract.js";
export {
  resourceExtractedContentBlockKinds,
} from "./ResourceExtractedContent.contract.js";

export type {
  ResourceExtractionDocument,
  ResourceExtractionDocumentStatus,
} from "./ResourceExtractionDocument.contract.js";
export {
  resourceExtractionDocumentStatuses,
} from "./ResourceExtractionDocument.contract.js";

export type {
  ResourceExtractionFailure,
  ResourceExtractionFailureCode,
  ResourceExtractionRequest,
  ResourceExtractionResult,
  UnsupportedPageExtractionFailure,
} from "./ResourceExtractionResult.contract.js";
export {
  resourceExtractionFailureCodes,
} from "./ResourceExtractionResult.contract.js";

export type {
  ExtractionProvenance,
  ExtractionProvenanceSource,
} from "./ExtractionProvenance.contract.js";
export {
  extractionProvenanceSources,
} from "./ExtractionProvenance.contract.js";

export type {
  ExtractedPage,
} from "./ExtractedPage.contract.js";

export type {
  ExtractedResourceContent,
} from "./ExtractedResourceContent.contract.js";