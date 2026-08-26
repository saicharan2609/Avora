import type {
  CitationId,
} from "@avora/core/identity";
import type {
  DbRetrievalChunkId,
  DbRetrievalChunkLocator,
  DbRetrievalChunkRecord,
} from "@avora/db/repositories/chunks";

import {
  summaryEnvelopeContainsChunkId,
} from "./GroundedSummaryContextEnvelope.js";
import type {
  GroundedSummaryContextEnvelope,
} from "./GroundedSummaryContextEnvelope.js";

export type SummaryCitation = Readonly<{
  citationId: CitationId;
  chunkId: DbRetrievalChunkId;
  resourceId: DbRetrievalChunkRecord["resourceId"];
  locator: DbRetrievalChunkLocator;
  quote: string;
}>;

export type SummaryCitationValidationIssueCode =
  | "citation_missing_from_context"
  | "citation_empty_quote";

export type SummaryCitationValidationIssue = Readonly<{
  code: SummaryCitationValidationIssueCode;
  citationId: CitationId;
  chunkId: DbRetrievalChunkId;
  message: string;
}>;

export type ValidateSummaryCitationsInput = Readonly<{
  envelope: GroundedSummaryContextEnvelope;
  citations: readonly SummaryCitation[];
}>;

export type SummaryCitationValidationResult =
  | Readonly<{
      valid: true;
    }>
  | Readonly<{
      valid: false;
      issues: readonly SummaryCitationValidationIssue[];
    }>;

export function validateSummaryCitations(
  input: ValidateSummaryCitationsInput,
): SummaryCitationValidationResult {
  const issues: SummaryCitationValidationIssue[] = [];

  for (const citation of input.citations) {
    if (!summaryEnvelopeContainsChunkId(input.envelope, citation.chunkId)) {
      issues.push({
        code: "citation_missing_from_context",
        citationId: citation.citationId,
        chunkId: citation.chunkId,
        message: "Citation chunk was not present in the grounded summary context envelope.",
      });
    }

    if (citation.quote.trim().length === 0) {
      issues.push({
        code: "citation_empty_quote",
        citationId: citation.citationId,
        chunkId: citation.chunkId,
        message: "Citation quote must not be empty.",
      });
    }
  }

  return issues.length === 0
    ? { valid: true }
    : {
        valid: false,
        issues,
      };
}
