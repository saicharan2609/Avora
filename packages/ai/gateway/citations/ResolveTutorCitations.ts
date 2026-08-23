import type {
  CitationId,
} from "@avora/core/identity";

import type {
  TutorAnswerRawCitation,
} from "../validation/index.js";
import type {
  Citation,
  GroundedContextEnvelope,
} from "../tutor/index.js";

export type TutorCitationResolutionFailureCode =
  | "tutor_citation_resolution_chunk_not_found"
  | "tutor_citation_resolution_empty_quote";

export type TutorCitationResolutionFailure = Readonly<{
  code: TutorCitationResolutionFailureCode;
  chunkId: string;
  message: string;
}>;

export type TutorCitationResolutionResult =
  | Readonly<{
      resolved: true;
      citations: readonly Citation[];
    }>
  | Readonly<{
      resolved: false;
      failures: readonly TutorCitationResolutionFailure[];
    }>;

export type ResolveTutorCitationsInput = Readonly<{
  envelope: GroundedContextEnvelope;
  rawCitations: readonly TutorAnswerRawCitation[];
  createCitationId: () => CitationId;
}>;

export function resolveTutorCitations(
  input: ResolveTutorCitationsInput,
): TutorCitationResolutionResult {
  const failures: TutorCitationResolutionFailure[] = [];
  const citations: Citation[] = [];

  for (const rawCitation of input.rawCitations) {
    const matchedChunk = input.envelope.evidence.find(
      (chunk) => chunk.chunkId === rawCitation.chunkId,
    );

    if (matchedChunk === undefined) {
      failures.push({
        code: "tutor_citation_resolution_chunk_not_found",
        chunkId: rawCitation.chunkId,
        message:
          "Model cited a chunkId that was not present in the supplied grounded context envelope.",
      });
      continue;
    }

    if (rawCitation.quote.trim().length === 0) {
      failures.push({
        code: "tutor_citation_resolution_empty_quote",
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
