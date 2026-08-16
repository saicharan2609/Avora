import type {
  ExtractionProvenance,
} from "./ExtractionProvenance.contract.js";
import type {
  UnsupportedPageExtractionFailure,
} from "./ResourceExtractionFailure.contract.js";
import type {
  ResourceExtractedPageId,
} from "./ResourceExtractionIdentifiers.contract.js";
import type {
  ResourceSourceLocator,
} from "./ResourceSourceLocator.contract.js";

export type ExtractedPage = Readonly<{
  pageId: ResourceExtractedPageId;
  pageNumber: number;
  text: string;
  locator: ResourceSourceLocator;
  confidence: number | null;
  provenance: ExtractionProvenance;
  failure: UnsupportedPageExtractionFailure | null;
}>;