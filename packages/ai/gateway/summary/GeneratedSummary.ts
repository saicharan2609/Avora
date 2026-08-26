import type {
  IsoDateTimeString,
} from "@avora/core/time";

import type {
  SummaryCitation,
} from "./Citation.js";
import type {
  GroundedSummaryContextEnvelope,
} from "./GroundedSummaryContextEnvelope.js";
import type {
  SummaryQuery,
} from "./SummaryQuery.js";

export type SummaryHeading = Readonly<{
  title: string;
  points: readonly string[];
}>;

export type SummaryBody = Readonly<{
  headings: readonly SummaryHeading[];
}>;

export type SummaryGatewayResponseStatus =
  | "generated"
  | "refused"
  | "insufficient_evidence";

export type SummaryInsufficiencyReason =
  | "no_indexed_chunks"
  | "grounded_context_empty";

export type SummaryInsufficiencyResponse = Readonly<{
  status: "insufficient_evidence";
  reason: SummaryInsufficiencyReason;
  query: SummaryQuery;
  message: string;
}>;

export type SummaryRefusalReason =
  | "ungrounded_summary_blocked"
  | "citation_validation_failed"
  | "invocation_failed";

export type SummaryRefusalResponse = Readonly<{
  status: "refused";
  reason: SummaryRefusalReason;
  query: SummaryQuery;
  message: string;
}>;

export type GeneratedSummary = Readonly<{
  status: "generated";
  query: SummaryQuery;
  context: GroundedSummaryContextEnvelope;
  body: SummaryBody;
  citations: readonly SummaryCitation[];
  // ENG-235: every AI output is stamped with provenance, model version, and
  // prompt version at persistence. provenance is implicit ("ai", per NN-07 —
  // this type only exists on the generated path) and promptVersion /
  // summaryStrategyVersion live on `query`; modelVersion is the concrete
  // provider model that produced this candidate (SummaryCandidate.modelVersion).
  modelVersion: string;
  createdAt: IsoDateTimeString;
}>;

export type SummaryGatewayResponse =
  | GeneratedSummary
  | SummaryInsufficiencyResponse
  | SummaryRefusalResponse;

export type CreateSummaryInsufficiencyResponseInput = Readonly<{
  query: SummaryQuery;
  reason: SummaryInsufficiencyReason;
}>;

export function createSummaryInsufficiencyResponse(
  input: CreateSummaryInsufficiencyResponseInput,
): SummaryInsufficiencyResponse {
  return {
    status: "insufficient_evidence",
    reason: input.reason,
    query: input.query,
    message:
      "I do not have enough indexed material from this resource to generate a reliable summary.",
  };
}

export type CreateSummaryRefusalResponseInput = Readonly<{
  query: SummaryQuery;
  reason: SummaryRefusalReason;
  message: string;
}>;

export function createSummaryRefusalResponse(
  input: CreateSummaryRefusalResponseInput,
): SummaryRefusalResponse {
  return {
    status: "refused",
    reason: input.reason,
    query: input.query,
    message: input.message,
  };
}
