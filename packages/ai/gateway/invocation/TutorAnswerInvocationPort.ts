import type {
  GroundedContextEnvelope,
  GroundedAnswer,
  TutorQuery,
} from "../tutor/index.js";

export const tutorAnswerTask = "tutor.answer" as const;

export const tutorAnswerQualityTiers = [
  "standard",
  "high",
] as const;

export type TutorAnswerTask = typeof tutorAnswerTask;

export type TutorAnswerQualityTier =
  (typeof tutorAnswerQualityTiers)[number];

export type TutorAnswerInvocationInput = Readonly<{
  task: TutorAnswerTask;
  qualityTier: TutorAnswerQualityTier;
  query: TutorQuery;
  context: GroundedContextEnvelope;
}>;

export type TutorAnswerCandidate = Readonly<{
  answerMessageId: GroundedAnswer["answerMessageId"];
  answerText: GroundedAnswer["answerText"];
  citations: GroundedAnswer["citations"];
  createdAt: GroundedAnswer["createdAt"];
}>;

export type TutorAnswerInvocationResult = Readonly<{
  candidate: TutorAnswerCandidate;
}>;

export type TutorAnswerInvocationPort = Readonly<{
  invokeTutorAnswer: (
    input: TutorAnswerInvocationInput,
  ) => Promise<TutorAnswerInvocationResult>;
}>;