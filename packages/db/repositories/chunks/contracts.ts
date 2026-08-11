import type { ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type { Database } from "../../generated/database.types.js";

export type DbRetrievalChunkId = string & {
  readonly __brand: "DbRetrievalChunkId";
};

export type DbRetrievalExtractionDocumentId = string & {
  readonly __brand: "DbRetrievalExtractionDocumentId";
};

export type DbRetrievalExtractedContentBlockId = string & {
  readonly __brand: "DbRetrievalExtractedContentBlockId";
};

export type DbRetrievalChunkingStrategyVersion = string & {
  readonly __brand: "DbRetrievalChunkingStrategyVersion";
};

export type DbRetrievalSanitisationStrategyVersion = string & {
  readonly __brand: "DbRetrievalSanitisationStrategyVersion";
};

export type DbRetrievalChunkContentKind =
  Database["public"]["Enums"]["retrieval_chunk_content_kind"];

export type DbRetrievalChunkSanitisationStatus =
  Database["public"]["Enums"]["retrieval_chunk_sanitisation_status"];

export type DbRetrievalChunkStatus =
  Database["public"]["Enums"]["retrieval_chunk_status"];

export type DbRetrievalChunkLocatorKind =
  | "document_page"
  | "slide"
  | "image_region"
  | "audio_time_range"
  | "video_time_range"
  | "text_span"
  | "unknown";

export type DbRetrievalChunkBoundingBox = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
  unit: "ratio" | "point" | "pixel";
}>;

export type DbRetrievalChunkTextSpan = Readonly<{
  startOffset: number;
  endOffset: number;
}>;

export type DbRetrievalChunkTimeRange = Readonly<{
  startSeconds: number;
  endSeconds: number;
}>;

export type DbRetrievalChunkLocator = Readonly<{
  kind: DbRetrievalChunkLocatorKind;
  pageNumber: number | null;
  slideNumber: number | null;
  boundingBox: DbRetrievalChunkBoundingBox | null;
  textSpan: DbRetrievalChunkTextSpan | null;
  timeRange: DbRetrievalChunkTimeRange | null;
  label: string | null;
}>;

export type DbRetrievalChunkSanitisation = Readonly<{
  status: DbRetrievalChunkSanitisationStatus;
  strategyVersion: DbRetrievalSanitisationStrategyVersion;
  warnings: readonly string[];
}>;

export type DbRetrievalChunkScopeFacets = Readonly<{
  termId: string | null;
  subjectId: string | null;
  structureUnitId: string | null;
  resourceId: ResourceId;
}>;

export type DbRetrievalChunkRecord = Readonly<{
  chunkId: DbRetrievalChunkId;
  studentId: StudentId;
  resourceId: ResourceId;
  extractionDocumentId: DbRetrievalExtractionDocumentId;
  sourceBlockIds: readonly DbRetrievalExtractedContentBlockId[];
  scope: DbRetrievalChunkScopeFacets;
  contentKind: DbRetrievalChunkContentKind;
  text: string;
  tokenEstimate: number;
  sanitisation: DbRetrievalChunkSanitisation;
  locator: DbRetrievalChunkLocator;
  sourceContentHash: string;
  chunkingStrategyVersion: DbRetrievalChunkingStrategyVersion;
  status: DbRetrievalChunkStatus;
  sortOrder: number;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}>;

export type CreateRetrievalChunkInput = Readonly<{
  chunkId: DbRetrievalChunkId;
  studentId: StudentId;
  resourceId: ResourceId;
  extractionDocumentId: DbRetrievalExtractionDocumentId;
  sourceBlockIds: readonly DbRetrievalExtractedContentBlockId[];
  termId: string | null;
  subjectId: string | null;
  structureUnitId: string | null;
  contentKind: DbRetrievalChunkContentKind;
  text: string;
  tokenEstimate: number;
  sanitisationStatus: DbRetrievalChunkSanitisationStatus;
  sanitisationStrategyVersion: DbRetrievalSanitisationStrategyVersion;
  sanitisationWarnings: readonly string[];
  locator: DbRetrievalChunkLocator;
  sourceContentHash: string;
  chunkingStrategyVersion: DbRetrievalChunkingStrategyVersion;
  sortOrder: number;
}>;

export type CreateRetrievalChunksInput = Readonly<{
  chunks: readonly CreateRetrievalChunkInput[];
}>;

export type GetRetrievalChunkByIdInput = Readonly<{
  studentId: StudentId;
  chunkId: DbRetrievalChunkId;
}>;

export type ListRetrievalChunksByResourceInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  status: DbRetrievalChunkStatus;
}>;

export type ListRetrievalChunksByExtractionDocumentInput = Readonly<{
  studentId: StudentId;
  extractionDocumentId: DbRetrievalExtractionDocumentId;
  status: DbRetrievalChunkStatus;
}>;

export type ListRetrievalChunksByScopeInput = Readonly<{
  studentId: StudentId;
  termId: string | null;
  subjectId: string | null;
  structureUnitId: string | null;
  resourceId: ResourceId | null;
  status: DbRetrievalChunkStatus;
}>;

export type RetrievalChunkRepository = Readonly<{
  createRetrievalChunk: (
    input: CreateRetrievalChunkInput,
  ) => Promise<DbRetrievalChunkRecord>;
  createRetrievalChunks: (
    input: CreateRetrievalChunksInput,
  ) => Promise<readonly DbRetrievalChunkRecord[]>;
  getRetrievalChunkById: (
    input: GetRetrievalChunkByIdInput,
  ) => Promise<DbRetrievalChunkRecord | null>;
  listRetrievalChunksByResource: (
    input: ListRetrievalChunksByResourceInput,
  ) => Promise<readonly DbRetrievalChunkRecord[]>;
  listRetrievalChunksByExtractionDocument: (
    input: ListRetrievalChunksByExtractionDocumentInput,
  ) => Promise<readonly DbRetrievalChunkRecord[]>;
  listRetrievalChunksByScope: (
    input: ListRetrievalChunksByScopeInput,
  ) => Promise<readonly DbRetrievalChunkRecord[]>;
}>;