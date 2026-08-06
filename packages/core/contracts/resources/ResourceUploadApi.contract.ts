import { z } from "zod";

export const resourceUploadApiResourceKinds = [
  "document",
  "image",
  "scan",
  "audio",
  "video",
  "archive",
  "other",
] as const;

export const resourceUploadApiLifecycleStates = [
  "pending_upload",
  "uploaded",
  "rejected",
  "processing",
  "ready",
  "failed",
  "deleted",
] as const;

export const resourceUploadApiStorageBuckets = [
  "quarantine",
  "originals",
  "derivatives",
  "exports",
  "shared",
] as const;

export const declareResourceUploadPath = "/api/resources/uploads" as const;
export const completeResourceUploadPathTemplate =
  "/api/resources/uploads/{resourceId}/complete" as const;

export const resourceUploadApiResourceKindSchema = z.enum(resourceUploadApiResourceKinds);

export const resourceUploadApiLifecycleStateSchema = z.enum(resourceUploadApiLifecycleStates);

export const resourceUploadApiStorageBucketSchema = z.enum(resourceUploadApiStorageBuckets);

export const resourceUploadApiResourceIdSchema = z
  .string()
  .uuid()
  .describe("Stable Avora resource identifier.");

export const resourceUploadApiObjectPathSchema = z
  .string()
  .min(1)
  .refine((value) => !value.includes("\\"), {
    message: "Storage object path must use forward slashes only.",
  })
  .refine((value) => value.split("/").every((segment) => segment.length > 0), {
    message: "Storage object path must not contain empty segments.",
  })
  .describe("Private storage object path scoped by the owning student.");

export const resourceUploadApiIsoDateTimeSchema = z
  .string()
  .datetime({
    offset: true,
  })
  .describe("ISO 8601 timestamp with offset.");

export const resourceUploadApiFilenameSchema = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .refine((value) => !value.includes("/") && !value.includes("\\"), {
    message: "Filename must not contain path separators.",
  })
  .describe("Student-visible original filename.");

export const resourceUploadApiMimeTypeSchema = z
  .string()
  .trim()
  .min(3)
  .max(255)
  .regex(/^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/i, {
    message: "Declared MIME type must use type/subtype format.",
  })
  .transform((value) => value.toLowerCase())
  .describe("Declared MIME type supplied before hostile upload validation.");

export const resourceUploadApiByteSizeSchema = z
  .number()
  .int()
  .positive()
  .safe()
  .max(52_428_800)
  .describe("Declared upload byte size.");

export const resourceUploadApiContentHashSchema = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .regex(/^[a-z0-9:_-]+$/i, {
    message: "Content hash contains unsupported characters.",
  })
  .transform((value) => value.toLowerCase())
  .describe("Client-computed content hash recorded after upload completion.");

export const resourceUploadApiStorageLocationSchema = z
  .object({
    bucket: resourceUploadApiStorageBucketSchema,
    objectPath: resourceUploadApiObjectPathSchema,
    version: z.number().int().positive().safe(),
  })
  .strict();

export const resourceUploadApiResourceSchema = z
  .object({
    resourceId: resourceUploadApiResourceIdSchema,
    kind: resourceUploadApiResourceKindSchema,
    originalFilename: resourceUploadApiFilenameSchema,
    declaredMimeType: resourceUploadApiMimeTypeSchema,
    byteSize: resourceUploadApiByteSizeSchema,
    contentHash: resourceUploadApiContentHashSchema.nullable(),
    lifecycleState: resourceUploadApiLifecycleStateSchema,
    storage: resourceUploadApiStorageLocationSchema,
    createdAt: resourceUploadApiIsoDateTimeSchema,
    updatedAt: resourceUploadApiIsoDateTimeSchema,
  })
  .strict();

export const resourceUploadApiTicketSchema = z
  .object({
    resourceId: resourceUploadApiResourceIdSchema,
    storage: resourceUploadApiStorageLocationSchema,
    uploadUrl: z.string().url(),
    expiresAt: resourceUploadApiIsoDateTimeSchema,
  })
  .strict();

export const declareResourceUploadRequestBodySchema = z
  .object({
    kind: resourceUploadApiResourceKindSchema,
    originalFilename: resourceUploadApiFilenameSchema,
    declaredMimeType: resourceUploadApiMimeTypeSchema,
    byteSize: resourceUploadApiByteSizeSchema,
  })
  .strict();

export const declareResourceUploadResponseBodySchema = z
  .object({
    resource: resourceUploadApiResourceSchema,
    ticket: resourceUploadApiTicketSchema,
  })
  .strict();

export const completeResourceUploadRequestBodySchema = z
  .object({
    contentHash: resourceUploadApiContentHashSchema,
  })
  .strict();

export const completeResourceUploadResponseBodySchema = z
  .object({
    resource: resourceUploadApiResourceSchema,
  })
  .strict();

export const resourceUploadApiErrorCodes = [
  "resource_upload_unauthenticated",
  "resource_upload_forbidden",
  "resource_upload_invalid_request",
  "resource_upload_not_found",
  "resource_upload_conflict",
  "resource_upload_limit_exceeded",
  "resource_upload_unavailable",
] as const;

export const resourceUploadApiErrorCodeSchema = z.enum(resourceUploadApiErrorCodes);

export const resourceUploadApiErrorResponseBodySchema = z
  .object({
    error: resourceUploadApiErrorCodeSchema,
    message: z.string().min(1),
  })
  .strict();

export const declareResourceUploadContract = {
  method: "POST",
  path: declareResourceUploadPath,
  requestBody: declareResourceUploadRequestBodySchema,
  responseBody: declareResourceUploadResponseBodySchema,
  errorResponseBody: resourceUploadApiErrorResponseBodySchema,
} as const;

export const completeResourceUploadContract = {
  method: "POST",
  pathTemplate: completeResourceUploadPathTemplate,
  requestBody: completeResourceUploadRequestBodySchema,
  responseBody: completeResourceUploadResponseBodySchema,
  errorResponseBody: resourceUploadApiErrorResponseBodySchema,
} as const;

export type ResourceUploadApiResourceKind = z.infer<
  typeof resourceUploadApiResourceKindSchema
>;

export type ResourceUploadApiLifecycleState = z.infer<
  typeof resourceUploadApiLifecycleStateSchema
>;

export type ResourceUploadApiStorageBucket = z.infer<
  typeof resourceUploadApiStorageBucketSchema
>;

export type ResourceUploadApiStorageLocation = z.infer<
  typeof resourceUploadApiStorageLocationSchema
>;

export type ResourceUploadApiResource = z.infer<typeof resourceUploadApiResourceSchema>;

export type ResourceUploadApiTicket = z.infer<typeof resourceUploadApiTicketSchema>;

export type DeclareResourceUploadRequestBody = z.input<
  typeof declareResourceUploadRequestBodySchema
>;

export type DeclareResourceUploadParsedRequestBody = z.output<
  typeof declareResourceUploadRequestBodySchema
>;

export type DeclareResourceUploadResponseBody = z.infer<
  typeof declareResourceUploadResponseBodySchema
>;

export type CompleteResourceUploadRequestBody = z.input<
  typeof completeResourceUploadRequestBodySchema
>;

export type CompleteResourceUploadParsedRequestBody = z.output<
  typeof completeResourceUploadRequestBodySchema
>;

export type CompleteResourceUploadResponseBody = z.infer<
  typeof completeResourceUploadResponseBodySchema
>;

export type ResourceUploadApiErrorCode = z.infer<typeof resourceUploadApiErrorCodeSchema>;

export type ResourceUploadApiErrorResponseBody = z.infer<
  typeof resourceUploadApiErrorResponseBodySchema
>;

export type DeclareResourceUploadContract = typeof declareResourceUploadContract;

export type CompleteResourceUploadContract = typeof completeResourceUploadContract;