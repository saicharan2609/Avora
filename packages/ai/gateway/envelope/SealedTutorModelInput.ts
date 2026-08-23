import type {
  DbRetrievalChunkId,
} from "@avora/db/repositories/chunks";

import type {
  TutorAcademicFramePart,
  TutorInteractionHistoryPart,
  TutorPersonalisationPart,
  TutorSixPartContext,
  TutorTaskContractPart,
} from "../context/index.js";

export const sealedTutorModelInputVersion = "sealed-tutor-model-input.v1" as const;

export type SealedTutorModelInputVersion = typeof sealedTutorModelInputVersion;

export type SealedTutorModelEvidenceItem = Readonly<{
  chunkId: DbRetrievalChunkId;
  text: string;
}>;

export type SealedTutorModelDataPayload = Readonly<{
  taskContract: TutorTaskContractPart;
  academicFrame: TutorAcademicFramePart;
  personalisation: TutorPersonalisationPart;
  evidence: readonly SealedTutorModelEvidenceItem[];
  interactionHistory: TutorInteractionHistoryPart;
}>;

export type SealedTutorModelInput = Readonly<{
  version: SealedTutorModelInputVersion;
  systemInstructionText: string;
  dataPayload: SealedTutorModelDataPayload;
  allowedChunkIds: readonly DbRetrievalChunkId[];
}>;

export function sealTutorModelInput(
  context: TutorSixPartContext,
): SealedTutorModelInput {
  return {
    version: sealedTutorModelInputVersion,
    systemInstructionText: context.systemPolicy.text,
    dataPayload: {
      taskContract: context.taskContract,
      academicFrame: context.academicFrame,
      personalisation: context.personalisation,
      evidence: context.evidence.map(sealEvidenceItem),
      interactionHistory: context.interactionHistory,
    },
    allowedChunkIds: context.allowedChunkIds,
  };
}

function sealEvidenceItem(
  chunk: TutorSixPartContext["evidence"][number],
): SealedTutorModelEvidenceItem {
  return {
    chunkId: chunk.chunkId,
    text: chunk.text,
  };
}
