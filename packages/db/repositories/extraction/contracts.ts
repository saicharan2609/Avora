import type { ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type { Database } from "../../generated/database.types.js";

export type DbResourceExtractionDocumentId = string & {
  readonly __brand: "DbResourceExtractionDocumentId";
};

export type DbResourceExtractedContentBlockId = string & {
  readonly __brand: "DbResourceExtractedContentBlockId";
};

export type DbResourceExtractedPageId = string & {
  readonly __brand: "DbResourceExtractedPageId";
};

export type DbResourceExtractionFailureId = string & {
  readonly __brand: "DbResourceExtractionFailureId";
};

export type DbResourceExtractionProvenanceId = string & {
  readonly __brand: "DbResourceExtractionProvenanceId";
};

export type DbResourceExtractionStrategyVersion = string & {
  readonly __brand: "DbResourceExtractionStrategyVersion";
};

export type DbResourceChunkingStrategyVersion = string & {
  readonly __brand: "DbResourceChunkingStrategyVersion";
};

export type DbResourceExtractionDocumentStatus =
  Database["public"]["Enums"]["resource_extraction_document_status"];

export type DbResourceExtractedContentBlockKind =
  Database["public"]["Enums"]["resource_extracted_content_block_kind"];

export type DbExtractionProvenanceSource =
  | "document_text"
  | "ocr"
  | "scan"
  | "handwriting"
  | "manual"
  | "system";

export type DbResourceExtractionFailureCode =
  | "resource_not_processable"
  | "storage_object_unavailable"
  | "unsupported_mime_type"
  | "unsupported_resource_kind"
  | "unsupported_page"
  | "empty_extraction"
  | "extractor_failed";

export type DbResourceSourceLocatorKind =
  | "document_page"
  | "slide"
  | "image_region"
  | "audio_time_range"
  | "video_time_range"
  | "text_span"
  | "unknown";

export type DbResourceBoundingBox = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
  unit: "ratio" | "point" | "pixel";
}>;

export type DbResourceTextSpan = Readonly<{
  startOffset: number;
  endOffset: number;
}>;

export type DbResourceTimeRange = Readonly<{
  startSeconds: number;
  endSeconds: number;
}>;

export type DbResourceSourceLocator = Readonly<{
  kind: DbResourceSourceLocatorKind;
  pageNumber: number | null;
  slideNumber: number | null;
  boundingBox: DbResourceBoundingBox | null;
  textSpan: DbResourceTextSpan | null;
  timeRange: DbResourceTimeRange | null;
  label: string | null;
}>;

export type DbResourceExtractionDocumentRecord = Readonly<{
  extractionDocumentId: DbResourceExtractionDocumentId;
  studentId: StudentId;
  resourceId: ResourceId;
  status: DbResourceExtractionDocumentStatus;
  extractionStrategyVersion: DbResourceExtractionStrategyVersion;
  chunkingStrategyVersion: DbResourceChunkingStrategyVersion;
  extractedAt: IsoDateTimeString;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}>;

export type DbResourceExtractedContentBlockRecord = Readonly<{
  blockId: DbResourceExtractedContentBlockId;
  extractionDocumentId: DbResourceExtractionDocumentId;
  studentId: StudentId;
  resourceId: ResourceId;
  kind: DbResourceExtractedContentBlockKind;
  text: string;
  locator: DbResourceSourceLocator;
  sortOrder: number;
  parentBlockId: DbResourceExtractedContentBlockId | null;
  confidence: number | null;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}>;

export type DbResourceExtractionProvenanceRecord = Readonly<{
  provenanceId: DbResourceExtractionProvenanceId;
  extractionDocumentId: DbResourceExtractionDocumentId;
  studentId: StudentId;
  resourceId: ResourceId;
  pageNumber: number | null;
  source: DbExtractionProvenanceSource;
  strategyVersion: DbResourceExtractionStrategyVersion;
  extractedAt: IsoDateTimeString;
  notes: string | null;
  createdAt: IsoDateTimeString;
}>;

export type DbResourceExtractedPageRecord = Readonly<{
  pageId: DbResourceExtractedPageId;
  extractionDocumentId: DbResourceExtractionDocumentId;
  studentId: StudentId;
  resourceId: ResourceId;
  provenanceId: DbResourceExtractionProvenanceId;
  pageNumber: number;
  text: string;
  locator: DbResourceSourceLocator;
  confidence: number | null;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}>;

export type DbResourceExtractionFailureRecord = Readonly<{
  failureId: DbResourceExtractionFailureId;
  extractionDocumentId: DbResourceExtractionDocumentId;
  studentId: StudentId;
  resourceId: ResourceId;
  provenanceId: DbResourceExtractionProvenanceId | null;
  code: DbResourceExtractionFailureCode;
  pageNumber: number | null;
  message: string;
  createdAt: IsoDateTimeString;
}>;

export type DbResourceExtractedContentBlockNode = Readonly<{
  block: DbResourceExtractedContentBlockRecord;
  children: readonly DbResourceExtractedContentBlockNode[];
}>;

export type DbResourceExtractionDocumentWithBlocks = Readonly<{
  document: DbResourceExtractionDocumentRecord;
  blocks: readonly DbResourceExtractedContentBlockRecord[];
}>;

export type DbResourceExtractionDocumentTree = Readonly<{
  document: DbResourceExtractionDocumentRecord;
  blocks: readonly DbResourceExtractedContentBlockNode[];
}>;

export type CreateResourceExtractionDocumentInput = Readonly<{
  extractionDocumentId: DbResourceExtractionDocumentId;
  studentId: StudentId;
  resourceId: ResourceId;
  status: DbResourceExtractionDocumentStatus;
  extractionStrategyVersion: DbResourceExtractionStrategyVersion;
  chunkingStrategyVersion: DbResourceChunkingStrategyVersion;
  extractedAt: IsoDateTimeString;
}>;

export type CreateResourceExtractedContentBlockInput = Readonly<{
  blockId: DbResourceExtractedContentBlockId;
  extractionDocumentId: DbResourceExtractionDocumentId;
  studentId: StudentId;
  resourceId: ResourceId;
  kind: DbResourceExtractedContentBlockKind;
  text: string;
  locator: DbResourceSourceLocator;
  sortOrder: number;
  parentBlockId: DbResourceExtractedContentBlockId | null;
  confidence: number | null;
}>;

export type CreateResourceExtractionProvenanceInput = Readonly<{
  provenanceId: DbResourceExtractionProvenanceId;
  extractionDocumentId: DbResourceExtractionDocumentId;
  studentId: StudentId;
  resourceId: ResourceId;
  pageNumber: number | null;
  source: DbExtractionProvenanceSource;
  strategyVersion: DbResourceExtractionStrategyVersion;
  extractedAt: IsoDateTimeString;
  notes: string | null;
}>;

export type CreateResourceExtractedPageInput = Readonly<{
  pageId: DbResourceExtractedPageId;
  extractionDocumentId: DbResourceExtractionDocumentId;
  studentId: StudentId;
  resourceId: ResourceId;
  provenanceId: DbResourceExtractionProvenanceId;
  pageNumber: number;
  text: string;
  locator: DbResourceSourceLocator;
  confidence: number | null;
}>;

export type CreateResourceExtractionFailureInput = Readonly<{
  failureId: DbResourceExtractionFailureId;
  extractionDocumentId: DbResourceExtractionDocumentId;
  studentId: StudentId;
  resourceId: ResourceId;
  provenanceId: DbResourceExtractionProvenanceId | null;
  code: DbResourceExtractionFailureCode;
  pageNumber: number | null;
  message: string;
}>;

export type CreateResourceExtractionDocumentWithBlocksInput = Readonly<{
  document: CreateResourceExtractionDocumentInput;
  blocks: readonly CreateResourceExtractedContentBlockInput[];
}>;

export type GetResourceExtractionDocumentByIdInput = Readonly<{
  studentId: StudentId;
  extractionDocumentId: DbResourceExtractionDocumentId;
}>;

export type ListResourceExtractionDocumentsByResourceInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
}>;

export type ListResourceExtractedContentBlocksInput = Readonly<{
  studentId: StudentId;
  extractionDocumentId: DbResourceExtractionDocumentId;
}>;

export type ListResourceExtractionProvenanceInput = Readonly<{
  studentId: StudentId;
  extractionDocumentId: DbResourceExtractionDocumentId;
}>;

export type ListResourceExtractedPagesInput = Readonly<{
  studentId: StudentId;
  extractionDocumentId: DbResourceExtractionDocumentId;
}>;

export type ListResourceExtractionFailuresInput = Readonly<{
  studentId: StudentId;
  extractionDocumentId: DbResourceExtractionDocumentId;
}>;

export type ResourceExtractionRepository = Readonly<{
  createResourceExtractionDocument: (
    input: CreateResourceExtractionDocumentInput,
  ) => Promise<DbResourceExtractionDocumentRecord>;
  createResourceExtractedContentBlocks: (
    input: readonly CreateResourceExtractedContentBlockInput[],
  ) => Promise<readonly DbResourceExtractedContentBlockRecord[]>;
  createResourceExtractionProvenance: (
    input: CreateResourceExtractionProvenanceInput,
  ) => Promise<DbResourceExtractionProvenanceRecord>;
  createResourceExtractedPages: (
    input: readonly CreateResourceExtractedPageInput[],
  ) => Promise<readonly DbResourceExtractedPageRecord[]>;
  createResourceExtractionFailures: (
    input: readonly CreateResourceExtractionFailureInput[],
  ) => Promise<readonly DbResourceExtractionFailureRecord[]>;
  createResourceExtractionDocumentWithBlocks: (
    input: CreateResourceExtractionDocumentWithBlocksInput,
  ) => Promise<DbResourceExtractionDocumentWithBlocks>;
  getResourceExtractionDocumentById: (
    input: GetResourceExtractionDocumentByIdInput,
  ) => Promise<DbResourceExtractionDocumentRecord | null>;
  listResourceExtractionDocumentsByResource: (
    input: ListResourceExtractionDocumentsByResourceInput,
  ) => Promise<readonly DbResourceExtractionDocumentRecord[]>;
  listResourceExtractedContentBlocks: (
    input: ListResourceExtractedContentBlocksInput,
  ) => Promise<readonly DbResourceExtractedContentBlockRecord[]>;
  listResourceExtractionProvenance: (
    input: ListResourceExtractionProvenanceInput,
  ) => Promise<readonly DbResourceExtractionProvenanceRecord[]>;
  listResourceExtractedPages: (
    input: ListResourceExtractedPagesInput,
  ) => Promise<readonly DbResourceExtractedPageRecord[]>;
  listResourceExtractionFailures: (
    input: ListResourceExtractionFailuresInput,
  ) => Promise<readonly DbResourceExtractionFailureRecord[]>;
  getResourceExtractionDocumentTree: (
    input: GetResourceExtractionDocumentByIdInput,
  ) => Promise<DbResourceExtractionDocumentTree | null>;
}>;