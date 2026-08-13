export type Provenance = "student" | "ai" | "co_created";

export type DataClassification =
  | "identity"
  | "academic_content"
  | "derived_artifact"
  | "behavioural"
  | "operational";

export type {
  TutorAnswerFormat,
  TutorAnswerLanguage,
  TutorExplanationDepth,
} from "./tutor/index.js";

export {
  tutorAnswerFormats,
  tutorAnswerLanguages,
  tutorExplanationDepths,
} from "./tutor/index.js";