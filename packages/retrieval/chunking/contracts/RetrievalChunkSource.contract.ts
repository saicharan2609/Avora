import type { ResourceId, StudentId } from "@avora/core/identity";

export type RetrievalExtractionDocumentId = string & {
  readonly __brand: "RetrievalExtractionDocumentId";
};

export type RetrievalExtractedContentBlockId = string & {
  readonly __brand: "RetrievalExtractedContentBlockId";
};

export type RetrievalChunkSource = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  extractionDocumentId: RetrievalExtractionDocumentId;
  sourceBlockIds: readonly RetrievalExtractedContentBlockId[];
  sourceContentHash: string;
}>;