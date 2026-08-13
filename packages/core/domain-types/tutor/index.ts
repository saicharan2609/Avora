export const tutorExplanationDepths = [
  "intuition",
  "standard",
  "rigorous",
] as const;

export type TutorExplanationDepth =
  (typeof tutorExplanationDepths)[number];

export const tutorAnswerLanguages = [
  "en",
] as const;

export type TutorAnswerLanguage =
  (typeof tutorAnswerLanguages)[number];

export const tutorAnswerFormats = [
  "explanation",
  "steps",
  "summary",
] as const;

export type TutorAnswerFormat =
  (typeof tutorAnswerFormats)[number];