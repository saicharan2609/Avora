import type {
  IsoDateTimeString,
} from "@avora/core/time";

import type {
  ResourceExtractionStrategyVersion,
} from "./ResourceExtractionIdentifiers.contract.js";

export const extractionProvenanceSources = [
  "document_text",
  "ocr",
  "scan",
  "handwriting",
  "manual",
  "system",
] as const;

export type ExtractionProvenanceSource =
  (typeof extractionProvenanceSources)[number];

export type ExtractionProvenance = Readonly<{
  source: ExtractionProvenanceSource;
  strategyVersion: ResourceExtractionStrategyVersion;
  extractedAt: IsoDateTimeString;
  notes: string | null;
}>;