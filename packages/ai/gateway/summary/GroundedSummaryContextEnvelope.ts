import type {
  DbRetrievalChunkId,
  DbRetrievalChunkLocator,
  DbRetrievalChunkRecord,
} from "@avora/db/repositories/chunks";

import type {
  SummaryQuery,
} from "./SummaryQuery.js";

export const groundedSummaryContextEnvelopeVersion =
  "grounded-summary-context-envelope.v1" as const;

export type GroundedSummaryContextEnvelopeVersion =
  typeof groundedSummaryContextEnvelopeVersion;

export type GroundedSummaryEvidenceChunk = Readonly<{
  chunkId: DbRetrievalChunkId;
  resourceId: DbRetrievalChunkRecord["resourceId"];
  locator: DbRetrievalChunkLocator;
  text: string;
  sortOrder: number;
}>;

export type GroundedSummaryContextEnvelope = Readonly<{
  version: GroundedSummaryContextEnvelopeVersion;
  query: SummaryQuery;
  evidence: readonly GroundedSummaryEvidenceChunk[];
  allowedChunkIds: readonly DbRetrievalChunkId[];
}>;

export type CreateGroundedSummaryContextEnvelopeInput = Readonly<{
  query: SummaryQuery;
  chunks: readonly DbRetrievalChunkRecord[];
}>;

export function createGroundedSummaryContextEnvelope(
  input: CreateGroundedSummaryContextEnvelopeInput,
): GroundedSummaryContextEnvelope {
  const evidence = input.chunks.map(mapChunkToEvidence);

  return {
    version: groundedSummaryContextEnvelopeVersion,
    query: input.query,
    evidence,
    allowedChunkIds: evidence.map((chunk) => chunk.chunkId),
  };
}

export function summaryEnvelopeContainsChunkId(
  envelope: GroundedSummaryContextEnvelope,
  chunkId: DbRetrievalChunkId,
): boolean {
  return envelope.allowedChunkIds.includes(chunkId);
}

function mapChunkToEvidence(
  chunk: DbRetrievalChunkRecord,
): GroundedSummaryEvidenceChunk {
  return {
    chunkId: chunk.chunkId,
    resourceId: chunk.resourceId,
    locator: chunk.locator,
    text: chunk.text,
    sortOrder: chunk.sortOrder,
  };
}
