import type { ResourceId, StudentId } from "@avora/core/identity";

import type {
  ExtractedResourceContent,
} from "./ExtractedResourceContent.contract.js";
import type {
  ResourceExtractionDocument,
} from "./ResourceExtractionDocument.contract.js";
import type {
  ResourceExtractionFailure,
} from "./ResourceExtractionFailure.contract.js";
import type {
  ResourceChunkingStrategyVersion,
  ResourceExtractionDocumentId,
  ResourceExtractionStrategyVersion,
} from "./ResourceExtractionIdentifiers.contract.js";
import type {
  ResourceStorageLocation,
} from "../ResourceStorage.contract.js";

export type ResourceExtractionRequest = Readonly<{
  extractionDocumentId: ResourceExtractionDocumentId;
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
      content: ExtractedResourceContent;
    }>
  | Readonly<{
      outcome: "partially_extracted";
      document: ResourceExtractionDocument;
      content: ExtractedResourceContent;
      warning: ResourceExtractionFailure;
    }>
  | Readonly<{
      outcome: "failed";
      failure: ResourceExtractionFailure;
    }>;