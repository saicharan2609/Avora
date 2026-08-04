import type { ChunkId, CitationId, ResourceId } from "@avora/core/identity";

export type CitationChipContract = Readonly<{
  citation: Readonly<{
    citationId: CitationId;
    chunkId: ChunkId;
    resourceId: ResourceId;
    locator: string;
  }>;
}>;