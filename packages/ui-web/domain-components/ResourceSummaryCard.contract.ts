import type { ChunkId, CitationId, ResourceId } from "@avora/core/identity";
import type { Provenance } from "@avora/core/domain-types";

export type ResourceSummaryCardHeadingContract = Readonly<{
  title: string;
  points: readonly string[];
}>;

export type ResourceSummaryCardCitationContract = Readonly<{
  citationId: CitationId;
  chunkId: ChunkId;
  locator: string;
}>;

export type ResourceSummaryCardContract = Readonly<{
  resourceId: ResourceId;
  headings: readonly ResourceSummaryCardHeadingContract[];
  citations: readonly ResourceSummaryCardCitationContract[];
  provenance: Extract<Provenance, "ai">;
}>;
