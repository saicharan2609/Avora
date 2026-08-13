import type {
  DbRetrievalChunkId,
  DbRetrievalChunkLocator,
  DbRetrievalChunkRecord,
} from "@avora/db/repositories/chunks";
import type {
  RetrievalSearchResult,
  ScopedSearchResult,
} from "@avora/retrieval/search";

import type {
  TutorQuery,
} from "./TutorQuery.js";

export const groundedContextEnvelopeVersion =
  "grounded-context-envelope.v1" as const;

export type GroundedContextEnvelopeVersion =
  typeof groundedContextEnvelopeVersion;

export type GroundedEvidenceChunk = Readonly<{
  chunkId: DbRetrievalChunkId;
  resourceId: DbRetrievalChunkRecord["resourceId"];
  extractionDocumentId: DbRetrievalChunkRecord["extractionDocumentId"];
  sourceBlockIds: DbRetrievalChunkRecord["sourceBlockIds"];
  locator: DbRetrievalChunkLocator;
  contentKind: DbRetrievalChunkRecord["contentKind"];
  text: string;
  sortOrder: number;
}>;

export type GroundedContextEnvelope = Readonly<{
  version: GroundedContextEnvelopeVersion;
  query: TutorQuery;
  evidence: readonly GroundedEvidenceChunk[];
  allowedChunkIds: readonly DbRetrievalChunkId[];
}>;

export type CreateGroundedContextEnvelopeInput = Readonly<{
  query: TutorQuery;
  scopedSearchResult: ScopedSearchResult;
}>;

export function createGroundedContextEnvelope(
  input: CreateGroundedContextEnvelopeInput,
): GroundedContextEnvelope {
  const evidence = input.scopedSearchResult.results.map(
    mapSearchResultToEvidenceChunk,
  );

  return {
    version: groundedContextEnvelopeVersion,
    query: input.query,
    evidence,
    allowedChunkIds: evidence.map((chunk) => chunk.chunkId),
  };
}

export function envelopeContainsChunkId(
  envelope: GroundedContextEnvelope,
  chunkId: DbRetrievalChunkId,
): boolean {
  return envelope.allowedChunkIds.includes(chunkId);
}

function mapSearchResultToEvidenceChunk(
  result: RetrievalSearchResult,
): GroundedEvidenceChunk {
  return {
    chunkId: result.chunk.chunkId,
    resourceId: result.chunk.resourceId,
    extractionDocumentId: result.chunk.extractionDocumentId,
    sourceBlockIds: result.chunk.sourceBlockIds,
    locator: result.chunk.locator,
    contentKind: result.chunk.contentKind,
    text: result.chunk.text,
    sortOrder: result.chunk.sortOrder,
  };
}