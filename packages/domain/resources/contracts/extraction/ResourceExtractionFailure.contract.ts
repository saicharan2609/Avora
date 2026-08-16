import type {
  ResourceExtractionFailureId,
} from "./ResourceExtractionIdentifiers.contract.js";

export const resourceExtractionFailureCodes = [
  "resource_not_processable",
  "storage_object_unavailable",
  "unsupported_mime_type",
  "unsupported_resource_kind",
  "unsupported_page",
  "empty_extraction",
  "extractor_failed",
] as const;

export type ResourceExtractionFailureCode =
  (typeof resourceExtractionFailureCodes)[number];

export type ResourceExtractionFailure = Readonly<{
  failureId: ResourceExtractionFailureId;
  code: ResourceExtractionFailureCode;
  message: string;
}>;

export type UnsupportedPageExtractionFailure = ResourceExtractionFailure &
  Readonly<{
    code: "unsupported_page";
    pageNumber: number;
  }>;