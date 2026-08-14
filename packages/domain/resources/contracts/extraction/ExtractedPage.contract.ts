import type {
  ExtractionProvenance,
} from "./ExtractionProvenance.contract.js";
import type {
  ResourceSourceLocator,
} from "./ResourceSourceLocator.contract.js";
import type {
  UnsupportedPageExtractionFailure,
} from "./ResourceExtractionResult.contract.js";

export type ExtractedPage = Readonly<{
  pageNumber: number;
  text: string;
  locator: ResourceSourceLocator;
  confidence: number | null;
  provenance: ExtractionProvenance;
  failure: UnsupportedPageExtractionFailure | null;
}>;