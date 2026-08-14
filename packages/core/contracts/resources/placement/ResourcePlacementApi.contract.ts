import { z } from "zod";

export const resourcePlacementCandidatesPath =
  "/api/resources/placement/candidates" as const;

export const acceptResourcePlacementCandidatePathTemplate =
  "/api/resources/placement/candidates/{candidateId}/accept" as const;

export const resourcePlacementCorrectionsPath =
  "/api/resources/placement/corrections" as const;

export const resourcePlacementsByAcademicUnitPath =
  "/api/resources/placement" as const;

export const resourcePlacementApiConfidenceLevels = [
  "student_confirmed",
  "high",
  "medium",
  "low",
  "unknown",
] as const;

export const resourcePlacementApiConfidenceSources = [
  "student",
  "imported",
  "system_suggested",
] as const;

export const resourcePlacementApiCandidateProvenances = [
  "resource_metadata",
  "resource_content",
  "student_declared",
  "imported",
] as const;

export const resourcePlacementApiStatuses = [
  "accepted",
  "tentative",
] as const;

export const resourcePlacementApiPlacementOutcomes = [
  "placed",
  "needs_review",
] as const;

export const resourcePlacementApiPlacementDecisions = [
  "accepted",
  "tentative",
  "needs_review",
] as const;

export const resourcePlacementApiErrorCodes = [
  "resource_placement_unauthenticated",
  "resource_placement_invalid_request",
  "resource_placement_not_found",
  "resource_placement_unavailable",
] as const;

export const resourcePlacementApiIdSchema = z
  .string()
  .uuid()
  .describe("Stable Avora UUID identifier.");

export const resourcePlacementApiResourceIdSchema =
  resourcePlacementApiIdSchema.describe("Stable Avora resource identifier.");

export const resourcePlacementApiCandidateIdSchema =
  resourcePlacementApiIdSchema.describe("Stable placement candidate identifier.");

export const resourcePlacementApiPlacementIdSchema =
  resourcePlacementApiIdSchema.describe("Stable resource placement identifier.");

export const resourcePlacementApiCorrectionIdSchema =
  resourcePlacementApiIdSchema.describe("Stable placement correction identifier.");

export const resourcePlacementApiAcademicTermIdSchema =
  resourcePlacementApiIdSchema.describe("Stable academic term identifier.");

export const resourcePlacementApiSubjectIdSchema =
  resourcePlacementApiIdSchema.describe("Stable subject identifier.");

export const resourcePlacementApiStructureUnitIdSchema =
  resourcePlacementApiIdSchema.describe("Stable structure unit identifier.");

export const resourcePlacementApiIsoDateTimeSchema = z
  .string()
  .datetime({
    offset: true,
  })
  .describe("ISO 8601 timestamp with offset.");

export const resourcePlacementApiReasonSchema = z
  .string()
  .trim()
  .min(1)
  .max(2_000)
  .describe("Human-readable placement or correction reason.");

export const resourcePlacementApiConfidenceLevelSchema = z.enum(
  resourcePlacementApiConfidenceLevels,
);

export const resourcePlacementApiConfidenceSourceSchema = z.enum(
  resourcePlacementApiConfidenceSources,
);

export const resourcePlacementApiCandidateProvenanceSchema = z.enum(
  resourcePlacementApiCandidateProvenances,
);

export const resourcePlacementApiStatusSchema = z.enum(
  resourcePlacementApiStatuses,
);

export const resourcePlacementApiPlacementOutcomeSchema = z.enum(
  resourcePlacementApiPlacementOutcomes,
);

export const resourcePlacementApiPlacementDecisionSchema = z.enum(
  resourcePlacementApiPlacementDecisions,
);

export const resourcePlacementApiErrorCodeSchema = z.enum(
  resourcePlacementApiErrorCodes,
);

export const resourcePlacementApiTargetSchema = z
  .object({
    termId: resourcePlacementApiAcademicTermIdSchema,
    subjectId: resourcePlacementApiSubjectIdSchema,
    structureUnitId: resourcePlacementApiStructureUnitIdSchema.nullable(),
  })
  .strict();

export const resourcePlacementApiConfidenceSchema = z
  .object({
    level: resourcePlacementApiConfidenceLevelSchema,
    source: resourcePlacementApiConfidenceSourceSchema,
    reason: resourcePlacementApiReasonSchema.nullable(),
  })
  .strict();

export const resourcePlacementApiCandidateSchema = z
  .object({
    candidateId: resourcePlacementApiCandidateIdSchema,
    resourceId: resourcePlacementApiResourceIdSchema,
    target: resourcePlacementApiTargetSchema,
    confidence: resourcePlacementApiConfidenceSchema,
    provenance: resourcePlacementApiCandidateProvenanceSchema,
    reason: resourcePlacementApiReasonSchema.nullable(),
    createdAt: resourcePlacementApiIsoDateTimeSchema,
  })
  .strict();

export const resourcePlacementApiPlacementSchema = z
  .object({
    placementId: resourcePlacementApiPlacementIdSchema,
    resourceId: resourcePlacementApiResourceIdSchema,
    target: resourcePlacementApiTargetSchema,
    confidence: resourcePlacementApiConfidenceSchema,
    status: resourcePlacementApiStatusSchema,
    createdAt: resourcePlacementApiIsoDateTimeSchema,
    updatedAt: resourcePlacementApiIsoDateTimeSchema,
  })
  .strict();

export const resourcePlacementApiCorrectionSchema = z
  .object({
    correctionId: resourcePlacementApiCorrectionIdSchema,
    resourceId: resourcePlacementApiResourceIdSchema,
    previousTarget: resourcePlacementApiTargetSchema.nullable(),
    correctedTarget: resourcePlacementApiTargetSchema,
    reason: resourcePlacementApiReasonSchema.nullable(),
    correctedAt: resourcePlacementApiIsoDateTimeSchema,
  })
  .strict();

export const resourcePlacementCandidatesQuerySchema = z
  .object({
    resourceId: resourcePlacementApiResourceIdSchema,
  })
  .strict();

export const resourcePlacementCandidatesResponseBodySchema = z
  .object({
    candidates: z.array(resourcePlacementApiCandidateSchema),
  })
  .strict();

export const acceptResourcePlacementCandidatePathParamsSchema = z
  .object({
    candidateId: resourcePlacementApiCandidateIdSchema,
  })
  .strict();

export const resourcePlacementPlacedResultSchema = z
  .object({
    outcome: z.literal("placed"),
    decision: z.enum(["accepted", "tentative"]),
    placement: resourcePlacementApiPlacementSchema,
    reason: resourcePlacementApiReasonSchema,
  })
  .strict();

export const resourcePlacementNeedsReviewResultSchema = z
  .object({
    outcome: z.literal("needs_review"),
    decision: z.literal("needs_review"),
    candidate: resourcePlacementApiCandidateSchema,
    reason: resourcePlacementApiReasonSchema,
  })
  .strict();

export const resourcePlacementResultSchema = z.discriminatedUnion("outcome", [
  resourcePlacementPlacedResultSchema,
  resourcePlacementNeedsReviewResultSchema,
]);

export const acceptResourcePlacementCandidateResponseBodySchema = z
  .object({
    result: resourcePlacementResultSchema,
  })
  .strict();

export const createResourcePlacementCorrectionRequestBodySchema = z
  .object({
    resourceId: resourcePlacementApiResourceIdSchema,
    correctedTarget: resourcePlacementApiTargetSchema,
    reason: resourcePlacementApiReasonSchema.nullable().optional(),
  })
  .strict();

export const createResourcePlacementCorrectionResponseBodySchema = z
  .object({
    correction: resourcePlacementApiCorrectionSchema,
  })
  .strict();

export const resourcePlacementsByAcademicUnitQuerySchema = z
  .object({
    termId: resourcePlacementApiAcademicTermIdSchema,
    subjectId: resourcePlacementApiSubjectIdSchema.optional(),
    structureUnitId: resourcePlacementApiStructureUnitIdSchema.optional(),
  })
  .strict();

export const resourcePlacementsByAcademicUnitResponseBodySchema = z
  .object({
    placements: z.array(resourcePlacementApiPlacementSchema),
  })
  .strict();

export const resourcePlacementApiErrorResponseBodySchema = z
  .object({
    error: resourcePlacementApiErrorCodeSchema,
    message: z.string().min(1),
  })
  .strict();

export const listResourcePlacementCandidatesContract = {
  method: "GET",
  path: resourcePlacementCandidatesPath,
  query: resourcePlacementCandidatesQuerySchema,
  responseBody: resourcePlacementCandidatesResponseBodySchema,
  errorResponseBody: resourcePlacementApiErrorResponseBodySchema,
} as const;

export const acceptResourcePlacementCandidateContract = {
  method: "POST",
  pathTemplate: acceptResourcePlacementCandidatePathTemplate,
  pathParams: acceptResourcePlacementCandidatePathParamsSchema,
  responseBody: acceptResourcePlacementCandidateResponseBodySchema,
  errorResponseBody: resourcePlacementApiErrorResponseBodySchema,
} as const;

export const createResourcePlacementCorrectionContract = {
  method: "POST",
  path: resourcePlacementCorrectionsPath,
  requestBody: createResourcePlacementCorrectionRequestBodySchema,
  responseBody: createResourcePlacementCorrectionResponseBodySchema,
  errorResponseBody: resourcePlacementApiErrorResponseBodySchema,
} as const;

export const listResourcePlacementsByAcademicUnitContract = {
  method: "GET",
  path: resourcePlacementsByAcademicUnitPath,
  query: resourcePlacementsByAcademicUnitQuerySchema,
  responseBody: resourcePlacementsByAcademicUnitResponseBodySchema,
  errorResponseBody: resourcePlacementApiErrorResponseBodySchema,
} as const;

export type ResourcePlacementApiConfidenceLevel = z.infer<
  typeof resourcePlacementApiConfidenceLevelSchema
>;

export type ResourcePlacementApiConfidenceSource = z.infer<
  typeof resourcePlacementApiConfidenceSourceSchema
>;

export type ResourcePlacementApiCandidateProvenance = z.infer<
  typeof resourcePlacementApiCandidateProvenanceSchema
>;

export type ResourcePlacementApiStatus = z.infer<
  typeof resourcePlacementApiStatusSchema
>;

export type ResourcePlacementApiTarget = z.infer<
  typeof resourcePlacementApiTargetSchema
>;

export type ResourcePlacementApiConfidence = z.infer<
  typeof resourcePlacementApiConfidenceSchema
>;

export type ResourcePlacementApiCandidate = z.infer<
  typeof resourcePlacementApiCandidateSchema
>;

export type ResourcePlacementApiPlacement = z.infer<
  typeof resourcePlacementApiPlacementSchema
>;

export type ResourcePlacementApiCorrection = z.infer<
  typeof resourcePlacementApiCorrectionSchema
>;

export type ResourcePlacementCandidatesQuery = z.input<
  typeof resourcePlacementCandidatesQuerySchema
>;

export type ResourcePlacementCandidatesParsedQuery = z.output<
  typeof resourcePlacementCandidatesQuerySchema
>;

export type ResourcePlacementCandidatesResponseBody = z.infer<
  typeof resourcePlacementCandidatesResponseBodySchema
>;

export type AcceptResourcePlacementCandidatePathParams = z.input<
  typeof acceptResourcePlacementCandidatePathParamsSchema
>;

export type AcceptResourcePlacementCandidateParsedPathParams = z.output<
  typeof acceptResourcePlacementCandidatePathParamsSchema
>;

export type AcceptResourcePlacementCandidateResponseBody = z.infer<
  typeof acceptResourcePlacementCandidateResponseBodySchema
>;

export type CreateResourcePlacementCorrectionRequestBody = z.input<
  typeof createResourcePlacementCorrectionRequestBodySchema
>;

export type CreateResourcePlacementCorrectionParsedRequestBody = z.output<
  typeof createResourcePlacementCorrectionRequestBodySchema
>;

export type CreateResourcePlacementCorrectionResponseBody = z.infer<
  typeof createResourcePlacementCorrectionResponseBodySchema
>;

export type ResourcePlacementsByAcademicUnitQuery = z.input<
  typeof resourcePlacementsByAcademicUnitQuerySchema
>;

export type ResourcePlacementsByAcademicUnitParsedQuery = z.output<
  typeof resourcePlacementsByAcademicUnitQuerySchema
>;

export type ResourcePlacementsByAcademicUnitResponseBody = z.infer<
  typeof resourcePlacementsByAcademicUnitResponseBodySchema
>;

export type ResourcePlacementApiErrorCode = z.infer<
  typeof resourcePlacementApiErrorCodeSchema
>;

export type ResourcePlacementApiErrorResponseBody = z.infer<
  typeof resourcePlacementApiErrorResponseBodySchema
>;

export type ListResourcePlacementCandidatesContract =
  typeof listResourcePlacementCandidatesContract;

export type AcceptResourcePlacementCandidateContract =
  typeof acceptResourcePlacementCandidateContract;

export type CreateResourcePlacementCorrectionContract =
  typeof createResourcePlacementCorrectionContract;

export type ListResourcePlacementsByAcademicUnitContract =
  typeof listResourcePlacementsByAcademicUnitContract;