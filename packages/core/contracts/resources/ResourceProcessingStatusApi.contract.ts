import { z } from "zod";

export const resourceProcessingStatusPathTemplate =
  "/api/resources/{resourceId}/status" as const;

export const resourceProcessingStatusApiResourceLifecycleStates = [
  "pending_upload",
  "uploaded",
  "rejected",
  "processing",
  "ready",
  "failed",
  "deleted",
] as const;

export const resourceProcessingStatusApiProcessingStatuses = [
  "not_started",
  "uploaded",
  "processing",
  "ready",
  "partially_ready",
  "failed",
  "rejected",
  "deleted",
] as const;

export const resourceProcessingStatusApiExtractionOutcomes = [
  "extracted",
  "partially_extracted",
  "failed",
] as const;

export const resourceProcessingStatusApiExtractionFailureCodes = [
  "resource_not_processable",
  "storage_object_unavailable",
  "unsupported_mime_type",
  "unsupported_resource_kind",
  "unsupported_page",
  "empty_extraction",
  "extractor_failed",
] as const;

export const resourceProcessingStatusApiProvenanceSources = [
  "document_text",
  "ocr",
  "scan",
  "handwriting",
  "manual",
  "system",
] as const;

export const resourceProcessingStatusApiErrorCodes = [
  "resource_processing_status_unauthenticated",
  "resource_processing_status_invalid_request",
  "resource_processing_status_not_found",
  "resource_processing_status_unavailable",
] as const;

export const resourceProcessingStatusApiResourceIdSchema = z
  .string()
  .uuid()
  .describe("Stable Avora resource identifier.");

export const resourceProcessingStatusApiIsoDateTimeSchema = z
  .string()
  .datetime({
    offset: true,
  })
  .describe("ISO 8601 timestamp with offset.");

export const resourceProcessingStatusApiLifecycleStateSchema = z.enum(
  resourceProcessingStatusApiResourceLifecycleStates,
);

export const resourceProcessingStatusApiProcessingStatusSchema = z.enum(
  resourceProcessingStatusApiProcessingStatuses,
);

export const resourceProcessingStatusApiExtractionOutcomeSchema = z.enum(
  resourceProcessingStatusApiExtractionOutcomes,
);

export const resourceProcessingStatusApiExtractionFailureCodeSchema = z.enum(
  resourceProcessingStatusApiExtractionFailureCodes,
);

export const resourceProcessingStatusApiProvenanceSourceSchema = z.enum(
  resourceProcessingStatusApiProvenanceSources,
);

export const resourceProcessingStatusApiErrorCodeSchema = z.enum(
  resourceProcessingStatusApiErrorCodes,
);

export const resourceProcessingStatusPathParamsSchema = z
  .object({
    resourceId: resourceProcessingStatusApiResourceIdSchema,
  })
  .strict();

export const resourceProcessingStatusResourceSchema = z
  .object({
    resourceId: resourceProcessingStatusApiResourceIdSchema,
    lifecycleState: resourceProcessingStatusApiLifecycleStateSchema,
    originalFilename: z.string().min(1),
    declaredMimeType: z.string().min(1),
    updatedAt: resourceProcessingStatusApiIsoDateTimeSchema,
  })
  .strict();

export const resourceProcessingStatusProcessingSchema = z
  .object({
    status: resourceProcessingStatusApiProcessingStatusSchema,
    terminal: z.boolean(),
  })
  .strict();

export const resourceProcessingStatusExtractionSchema = z
  .object({
    extractionDocumentId: resourceProcessingStatusApiResourceIdSchema,
    outcome: resourceProcessingStatusApiExtractionOutcomeSchema,
    extractedAt: resourceProcessingStatusApiIsoDateTimeSchema,
  })
  .strict();

export const resourceProcessingStatusPreviewSchema = z
  .object({
    pageCount: z.number().int().nonnegative().safe(),
    extractedPageCount: z.number().int().nonnegative().safe(),
    failedPageCount: z.number().int().nonnegative().safe(),
    blockCount: z.number().int().nonnegative().safe(),
    characterCount: z.number().int().nonnegative().safe(),
    provenanceSources: z.array(resourceProcessingStatusApiProvenanceSourceSchema),
  })
  .strict();

export const resourceProcessingStatusFailureSchema = z
  .object({
    failureId: resourceProcessingStatusApiResourceIdSchema,
    code: resourceProcessingStatusApiExtractionFailureCodeSchema,
    message: z.string().min(1),
    pageNumber: z.number().int().positive().safe().nullable(),
  })
  .strict();

export const resourceProcessingStatusResponseBodySchema = z
  .object({
    resource: resourceProcessingStatusResourceSchema,
    processing: resourceProcessingStatusProcessingSchema,
    extraction: resourceProcessingStatusExtractionSchema.nullable(),
    preview: resourceProcessingStatusPreviewSchema.optional(),
    failures: z.array(resourceProcessingStatusFailureSchema).optional(),
  })
  .strict();

export const resourceProcessingStatusErrorResponseBodySchema = z
  .object({
    error: resourceProcessingStatusApiErrorCodeSchema,
    message: z.string().min(1),
  })
  .strict();

export const getResourceProcessingStatusContract = {
  method: "GET",
  pathTemplate: resourceProcessingStatusPathTemplate,
  pathParams: resourceProcessingStatusPathParamsSchema,
  responseBody: resourceProcessingStatusResponseBodySchema,
  errorResponseBody: resourceProcessingStatusErrorResponseBodySchema,
} as const;

export type ResourceProcessingStatusApiResourceLifecycleState = z.infer<
  typeof resourceProcessingStatusApiLifecycleStateSchema
>;

export type ResourceProcessingStatusApiProcessingStatus = z.infer<
  typeof resourceProcessingStatusApiProcessingStatusSchema
>;

export type ResourceProcessingStatusApiExtractionOutcome = z.infer<
  typeof resourceProcessingStatusApiExtractionOutcomeSchema
>;

export type ResourceProcessingStatusApiExtractionFailureCode = z.infer<
  typeof resourceProcessingStatusApiExtractionFailureCodeSchema
>;

export type ResourceProcessingStatusApiProvenanceSource = z.infer<
  typeof resourceProcessingStatusApiProvenanceSourceSchema
>;

export type ResourceProcessingStatusApiErrorCode = z.infer<
  typeof resourceProcessingStatusApiErrorCodeSchema
>;

export type ResourceProcessingStatusPathParams = z.input<
  typeof resourceProcessingStatusPathParamsSchema
>;

export type ResourceProcessingStatusParsedPathParams = z.output<
  typeof resourceProcessingStatusPathParamsSchema
>;

export type ResourceProcessingStatusResource = z.infer<
  typeof resourceProcessingStatusResourceSchema
>;

export type ResourceProcessingStatusProcessing = z.infer<
  typeof resourceProcessingStatusProcessingSchema
>;

export type ResourceProcessingStatusExtraction = z.infer<
  typeof resourceProcessingStatusExtractionSchema
>;

export type ResourceProcessingStatusPreview = z.infer<
  typeof resourceProcessingStatusPreviewSchema
>;

export type ResourceProcessingStatusFailure = z.infer<
  typeof resourceProcessingStatusFailureSchema
>;

export type ResourceProcessingStatusResponseBody = z.infer<
  typeof resourceProcessingStatusResponseBodySchema
>;

export type ResourceProcessingStatusResponse =
  ResourceProcessingStatusResponseBody;

export type ResourceProcessingStatusErrorResponseBody = z.infer<
  typeof resourceProcessingStatusErrorResponseBodySchema
>;

export type GetResourceProcessingStatusContract =
  typeof getResourceProcessingStatusContract;