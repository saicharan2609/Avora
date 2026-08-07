import type { ResourceId, StudentId } from "@avora/core/identity";

import type {
  ResourceExtractionDocument,
} from "./ResourceExtractionDocument.contract.js";
import type {
  ResourceChunkingStrategyVersion,
  ResourceExtractionStrategyVersion,
} from "./ResourceExtractionIdentifiers.contract.js";
import type {
  ResourceStorageLocation,
} from "../ResourceStorage.contract.js";

export const resourceExtractionFailureCodes = [
  "resource_not_processable",
  "storage_object_unavailable",
  "unsupported_mime_type",
  "unsupported_resource_kind",
  "empty_extraction",
  "extractor_failed",
] as const;

export type ResourceExtractionFailureCode =
  (typeof resourceExtractionFailureCodes)[number];

export type ResourceExtractionFailure = Readonly<{
  code: ResourceExtractionFailureCode;
  message: string;
}>;

export type ResourceExtractionRequest = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  storage: ResourceStorageLocation;
  declaredMimeType: string;
  contentHash: string;
  extractionStrategyVersion: ResourceExtractionStrategyVersion;
  chunkingStrategyVersion: ResourceChunkingStrategyVersion;
}>;

export type ResourceExtractionResult =
  | Readonly<{
      outcome: "extracted";
      document: ResourceExtractionDocument;
    }>
  | Readonly<{
      outcome: "partially_extracted";
      document: ResourceExtractionDocument;
      warning: ResourceExtractionFailure;
    }>
  | Readonly<{
      outcome: "failed";
      failure: ResourceExtractionFailure;
    }>;