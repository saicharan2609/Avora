import type { ChunkId } from "@avora/core/identity";
import type { GeneratedSummary } from "@avora/ai";
import type {
  DbResourceSummaryBody,
  DbResourceSummaryCitation,
  SaveResourceSummaryInput,
} from "@avora/db/repositories/resource-summaries";

// Bridges the AI Gateway's GeneratedSummary shape (DbRetrievalChunkId-keyed
// citations, @avora/db-typed) into the repository's persistence input
// (ChunkId-keyed citations, @avora/core-typed). Both are structurally
// identical branded strings; this mapper is the one seam that converts
// between the two, mirroring how apps/worker/src/resource-classification's
// mapper.ts converts DbRetrievalChunkRecord into domain-shaped signals.
export function mapGeneratedSummaryToSaveInput(
  summary: GeneratedSummary,
): SaveResourceSummaryInput {
  return {
    studentId: summary.query.studentId,
    resourceId: summary.query.resourceId,
    promptVersion: summary.query.promptVersion,
    summaryStrategyVersion: summary.query.summaryStrategyVersion,
    modelVersion: summary.modelVersion,
    body: mapBody(summary.body),
    citations: summary.citations.map(mapCitation),
  };
}

function mapBody(body: GeneratedSummary["body"]): DbResourceSummaryBody {
  return {
    headings: body.headings.map((heading) => ({
      title: heading.title,
      points: heading.points,
    })),
  };
}

function mapCitation(
  citation: GeneratedSummary["citations"][number],
): DbResourceSummaryCitation {
  return {
    chunkId: citation.chunkId as unknown as ChunkId,
    quote: citation.quote,
  };
}
