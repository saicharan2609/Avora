export type {
  CitationValidityCase,
  EvaluationChunk,
  EvaluationCitation,
} from "./citation-validity.fixture.js";

export type {
  CitationValidityOutcome,
} from "./citation-validity.gate.js";

export {
  runCitationValidityGate,
} from "./citation-validity.gate.js";

export type {
  ResourceExtractionQualityCaseKind,
  ResourceExtractionQualityEvalCase,
  ResourceExtractionQualityExpectedOutcome,
  ResourceExtractionQualityExpectations,
  SyntheticExtractedContentBlock,
  SyntheticExtractedPage,
  SyntheticExtractedResourceContent,
  SyntheticExtractionDocument,
  SyntheticExtractionFailure,
  SyntheticExtractionFailureCode,
  SyntheticExtractionProvenance,
  SyntheticExtractionProvenanceSource,
  SyntheticResourceExtractionResult,
  SyntheticResourceSourceLocator,
  SyntheticUnsupportedPageExtractionFailure,
} from "./resource-extraction-quality.fixture.js";

export {
  resourceExtractionQualityEvalCases,
} from "./resource-extraction-quality.fixture.js";

export type {
  ResourceExtractionQualityCaseReport,
  ResourceExtractionQualityGateOutcome,
} from "./resource-extraction-quality.gate.js";

export {
  ResourceExtractionQualityGateFailure,
  evaluateResourceExtractionQualityCase,
  runResourceExtractionQualityGate,
  summarizeResourceExtractionQualityGate,
} from "./resource-extraction-quality.gate.js";

export type {
  TutorGroundingEvalCase,
  TutorGroundingEvalCaseKind,
  TutorGroundingExpectedOutcome,
} from "./tutor-grounding.fixture.js";

export {
  tutorGroundingEvalCases,
} from "./tutor-grounding.fixture.js";

export {
  TutorGroundingGateFailure,
  runTutorGroundingGate,
} from "./tutor-grounding.gate.js";