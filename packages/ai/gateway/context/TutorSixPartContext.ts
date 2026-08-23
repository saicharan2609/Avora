import type {
  DbRetrievalChunkId,
} from "@avora/db/repositories/chunks";
import type {
  ScopedSearchScope,
} from "@avora/retrieval/scope";
import type {
  GroundedContextEnvelope,
  GroundedEvidenceChunk,
  TutorQuery,
} from "../tutor/index.js";
import type {
  TutorSystemPolicy,
} from "../../prompts/tutor/TutorSystemPolicy.js";

export const tutorSixPartContextVersion = "tutor-six-part-context.v1" as const;

export type TutorSixPartContextVersion = typeof tutorSixPartContextVersion;

export const tutorAnswerOutputContractShape =
  "{\"answerText\": string, \"citations\": [{\"chunkId\": string, \"quote\": string}]}" as const;

export type TutorSystemPolicyPart = TutorSystemPolicy;

export type TutorTaskContractPart = Readonly<{
  task: "tutor.answer";
  depth: TutorQuery["depth"];
  answerFormat: TutorQuery["answerFormat"];
  language: TutorQuery["language"];
  question: string;
  outputContractShape: typeof tutorAnswerOutputContractShape;
}>;

export type TutorAcademicFramePart = ScopedSearchScope;

export type TutorPersonalisationPart = null;

export type TutorEvidenceEnvelopePart = readonly GroundedEvidenceChunk[];

export type TutorInteractionHistoryPart = readonly [];

export type TutorSixPartContext = Readonly<{
  version: TutorSixPartContextVersion;
  systemPolicy: TutorSystemPolicyPart;
  taskContract: TutorTaskContractPart;
  academicFrame: TutorAcademicFramePart;
  personalisation: TutorPersonalisationPart;
  evidence: TutorEvidenceEnvelopePart;
  interactionHistory: TutorInteractionHistoryPart;
  allowedChunkIds: readonly DbRetrievalChunkId[];
}>;

export type AssembleTutorSixPartContextInput = Readonly<{
  query: TutorQuery;
  context: GroundedContextEnvelope;
  systemPolicy: TutorSystemPolicy;
}>;

export function assembleTutorSixPartContext(
  input: AssembleTutorSixPartContextInput,
): TutorSixPartContext {
  return {
    version: tutorSixPartContextVersion,
    systemPolicy: input.systemPolicy,
    taskContract: {
      task: "tutor.answer",
      depth: input.query.depth,
      answerFormat: input.query.answerFormat,
      language: input.query.language,
      question: input.query.question,
      outputContractShape: tutorAnswerOutputContractShape,
    },
    academicFrame: input.query.scope,
    personalisation: null,
    evidence: input.context.evidence,
    interactionHistory: [],
    allowedChunkIds: input.context.allowedChunkIds,
  };
}
