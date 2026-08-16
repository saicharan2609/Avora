import type {
  ResourceId,
  StudentId,
} from "@avora/core/identity";
import type {
  IsoDateTimeString,
} from "@avora/core/time";

import type {
  ExtractedPage,
} from "./ExtractedPage.contract.js";
import type {
  ExtractionProvenance,
} from "./ExtractionProvenance.contract.js";
import type {
  ResourceExtractedContentBlock,
} from "./ResourceExtractedContent.contract.js";
import type {
  ResourceChunkingStrategyVersion,
  ResourceExtractionDocumentId,
  ResourceExtractionStrategyVersion,
} from "./ResourceExtractionIdentifiers.contract.js";

export type ExtractedResourceContent = Readonly<{
  extractionDocumentId: ResourceExtractionDocumentId;
  studentId: StudentId;
  resourceId: ResourceId;
  extractionStrategyVersion: ResourceExtractionStrategyVersion;
  chunkingStrategyVersion: ResourceChunkingStrategyVersion;
  pages: readonly ExtractedPage[];
  blocks: readonly ResourceExtractedContentBlock[];
  provenance: ExtractionProvenance;
  extractedAt: IsoDateTimeString;
}>;