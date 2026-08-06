export const resourceIngestionValidationIssueCodes = [
  "resource_not_found",
  "resource_not_uploaded",
  "resource_storage_mismatch",
  "resource_content_hash_mismatch",
  "resource_byte_size_mismatch",
  "resource_mime_type_mismatch",
  "storage_object_not_found",
  "storage_object_unavailable",
] as const;

export type ResourceIngestionValidationIssueCode =
  (typeof resourceIngestionValidationIssueCodes)[number];

export type ResourceIngestionValidationIssue = Readonly<{
  code: ResourceIngestionValidationIssueCode;
  message: string;
}>;

export type ResourceIngestionValidationResult =
  | Readonly<{
      outcome: "valid";
    }>
  | Readonly<{
      outcome: "rejected";
      issue: ResourceIngestionValidationIssue;
    }>;