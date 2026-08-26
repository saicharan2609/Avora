import type {
  ResourceId,
} from "@avora/core/identity";
import type {
  DbRetrievalChunkId,
} from "@avora/db/repositories/chunks";

import type {
  GroundedSummaryContextEnvelope,
  GroundedSummaryEvidenceChunk,
  SummaryQuery,
} from "../summary/index.js";
import type {
  SummarySystemPolicy,
} from "../../prompts/summary/SummarySystemPolicy.js";

export const summarySixPartContextVersion = "summary-six-part-context.v1" as const;

export type SummarySixPartContextVersion = typeof summarySixPartContextVersion;

export const summaryOutputContractShape =
  "{\"headings\": [{\"title\": string, \"points\": [string]}], \"citations\": [{\"chunkId\": string, \"quote\": string}]}" as const;

export type SummarySystemPolicyPart = SummarySystemPolicy;

export type SummaryTaskContractPart = Readonly<{
  task: "summary.generate";
  outputContractShape: typeof summaryOutputContractShape;
}>;

export type SummaryAcademicFramePart = Readonly<{
  resourceId: ResourceId;
}>;

export type SummaryPersonalisationPart = null;

export type SummaryEvidenceEnvelopePart = readonly GroundedSummaryEvidenceChunk[];

export type SummaryInteractionHistoryPart = readonly [];

export type SummarySixPartContext = Readonly<{
  version: SummarySixPartContextVersion;
  systemPolicy: SummarySystemPolicyPart;
  taskContract: SummaryTaskContractPart;
  academicFrame: SummaryAcademicFramePart;
  personalisation: SummaryPersonalisationPart;
  evidence: SummaryEvidenceEnvelopePart;
  interactionHistory: SummaryInteractionHistoryPart;
  allowedChunkIds: readonly DbRetrievalChunkId[];
}>;

export type AssembleSummarySixPartContextInput = Readonly<{
  query: SummaryQuery;
  context: GroundedSummaryContextEnvelope;
  systemPolicy: SummarySystemPolicy;
}>;

export function assembleSummarySixPartContext(
  input: AssembleSummarySixPartContextInput,
): SummarySixPartContext {
  return {
    version: summarySixPartContextVersion,
    systemPolicy: input.systemPolicy,
    taskContract: {
      task: "summary.generate",
      outputContractShape: summaryOutputContractShape,
    },
    academicFrame: {
      resourceId: input.query.resourceId,
    },
    personalisation: null,
    evidence: input.context.evidence,
    interactionHistory: [],
    allowedChunkIds: input.context.allowedChunkIds,
  };
}
