import type {
  CitationId,
} from "@avora/core/identity";
import type {
  DbRetrievalChunkId,
  DbRetrievalChunkLocator,
  DbRetrievalChunkRecord,
} from "@avora/db/repositories/chunks";

import {
  envelopeContainsChunkId,
} from "./GroundedContextEnvelope.js";
import type {
  GroundedContextEnvelope,
} from "./GroundedContextEnvelope.js";

export type Citation = Readonly<{
  citationId: CitationId;
  chunkId: DbRetrievalChunkId;
  resourceId: DbRetrievalChunkRecord["resourceId"];
  locator: DbRetrievalChunkLocator;
  quote: string;
}>;

export type CitationValidationIssueCode =
  | "citation_missing_from_context"
  | "citation_empty_quote";

export type CitationValidationIssue = Readonly<{
  code: CitationValidationIssueCode;
  citationId: CitationId;
  chunkId: DbRetrievalChunkId;
  message: string;
}>;

export type ValidateCitationsInput = Readonly<{
  envelope: GroundedContextEnvelope;
  citations: readonly Citation[];
}>;

export type CitationValidationResult =
  | Readonly<{
      valid: true;
    }>
  | Readonly<{
      valid: false;
      issues: readonly CitationValidationIssue[];
    }>;

export function validateCitations(
  input: ValidateCitationsInput,
): CitationValidationResult {
  const issues: CitationValidationIssue[] = [];

  for (const citation of input.citations) {
    if (!envelopeContainsChunkId(input.envelope, citation.chunkId)) {
      issues.push({
        code: "citation_missing_from_context",
        citationId: citation.citationId,
        chunkId: citation.chunkId,
        message: "Citation chunk was not present in the grounded context envelope.",
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