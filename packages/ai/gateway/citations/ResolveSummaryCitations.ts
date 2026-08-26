import type {
  CitationId,
} from "@avora/core/identity";

import type {
  SummaryRawCitation,
} from "../validation/index.js";
import type {
  GroundedSummaryContextEnvelope,
  SummaryCitation,
} from "../summary/index.js";

export type SummaryCitationResolutionFailureCode =
  | "summary_citation_resolution_chunk_not_found"
  | "summary_citation_resolution_empty_quote";

export type SummaryCitationResolutionFailure = Readonly<{
  code: SummaryCitationResolutionFailureCode;
  chunkId: string;
  message: string;
}>;

export type SummaryCitationResolutionResult =
  | Readonly<{
      resolved: true;
      citations: readonly SummaryCitation[];
    }>
  | Readonly<{
      resolved: false;
      failures: readonly SummaryCitationResolutionFailure[];
    }>;

export type ResolveSummaryCitationsInput = Readonly<{
  envelope: GroundedSummaryContextEnvelope;
  rawCitations: readonly SummaryRawCitation[];
  createCitationId: () => CitationId;
}>;

// Citation locality (NN-11, ENG-224, ENG-225): the envelope's evidence set
// is constructed exclusively from the summary query's own resourceId
// (GroundedSummaryContextEnvelope), so a citation resolved against this
// envelope can never reference a chunk from a different resource. There is
// no separate cross-resource check to perform here — the guarantee comes
// from what the envelope was built from, the same structural approach
// resolveTutorCitations relies on for its own scope.
export function resolveSummaryCitations(
  input: ResolveSummaryCitationsInput,
): SummaryCitationResolutionResult {
  const failures: SummaryCitationResolutionFailure[] = [];
  const citations: SummaryCitation[] = [];

  for (const rawCitation of input.rawCitations) {
    const matchedChunk = input.envelope.evidence.find(
      (chunk) => chunk.chunkId === rawCitation.chunkId,
    );

    if (matchedChunk === undefined) {
      failures.push({
        code: "summary_citation_resolution_chunk_not_found",
        chunkId: rawCitation.chunkId,
        message:
          "Model cited a chunkId that was not present in the supplied grounded summary context envelope.",
      });
      continue;
    }

    if (rawCitation.quote.trim().length === 0) {
      failures.push({
        code: "summary_citation_resolution_empty_quote",
        chunkId: rawCitation.chunkId,
        message: "Model citation quote must not be empty.",
      });
      continue;
    }

    citations.push({
      citationId: input.createCitationId(),
      chunkId: matchedChunk.chunkId,
      resourceId: matchedChunk.resourceId,
      locator: matchedChunk.locator,
      quote: rawCitation.quote,
    });
  }

  return failures.length === 0
    ? {
        resolved: true,
        citations,
      }
    : {
        resolved: false,
        failures,
      };
}
