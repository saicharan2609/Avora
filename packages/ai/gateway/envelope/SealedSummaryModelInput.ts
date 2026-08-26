import type {
  DbRetrievalChunkId,
} from "@avora/db/repositories/chunks";

import type {
  SummaryAcademicFramePart,
  SummaryInteractionHistoryPart,
  SummaryPersonalisationPart,
  SummarySixPartContext,
  SummaryTaskContractPart,
} from "../context/index.js";

export const sealedSummaryModelInputVersion = "sealed-summary-model-input.v1" as const;

export type SealedSummaryModelInputVersion = typeof sealedSummaryModelInputVersion;

export type SealedSummaryModelEvidenceItem = Readonly<{
  chunkId: DbRetrievalChunkId;
  text: string;
}>;

export type SealedSummaryModelDataPayload = Readonly<{
  taskContract: SummaryTaskContractPart;
  academicFrame: SummaryAcademicFramePart;
  personalisation: SummaryPersonalisationPart;
  evidence: readonly SealedSummaryModelEvidenceItem[];
  interactionHistory: SummaryInteractionHistoryPart;
}>;

export type SealedSummaryModelInput = Readonly<{
  version: SealedSummaryModelInputVersion;
  systemInstructionText: string;
  dataPayload: SealedSummaryModelDataPayload;
  allowedChunkIds: readonly DbRetrievalChunkId[];
}>;

export function sealSummaryModelInput(
  context: SummarySixPartContext,
): SealedSummaryModelInput {
  return {
    version: sealedSummaryModelInputVersion,
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
  chunk: SummarySixPartContext["evidence"][number],
): SealedSummaryModelEvidenceItem {
  return {
    chunkId: chunk.chunkId,
    text: chunk.text,
  };
}
