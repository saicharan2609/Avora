import type { ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type {
  ResourceExtractedContentBlock,
} from "./ResourceExtractedContent.contract.js";
import type {
  ResourceChunkingStrategyVersion,
  ResourceExtractionDocumentId,
  ResourceExtractionStrategyVersion,
} from "./ResourceExtractionIdentifiers.contract.js";

export const resourceExtractionDocumentStatuses = [
  "extracted",
  "partially_extracted",
  "failed",
] as const;

export type ResourceExtractionDocumentStatus =
  (typeof resourceExtractionDocumentStatuses)[number];

export type ResourceExtractionDocument = Readonly<{
  extractionDocumentId: ResourceExtractionDocumentId;
  studentId: StudentId;
  resourceId: ResourceId;
  status: ResourceExtractionDocumentStatus;
  extractionStrategyVersion: ResourceExtractionStrategyVersion;
  chunkingStrategyVersion: ResourceChunkingStrategyVersion;
  extractedAt: IsoDateTimeString;
  blocks: readonly ResourceExtractedContentBlock[];
}>;