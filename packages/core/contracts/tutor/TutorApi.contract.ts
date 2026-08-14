import { z } from "zod";

import {
  tutorAnswerFormats,
  tutorAnswerLanguages,
  tutorExplanationDepths,
} from "../../domain-types/index.js";

export const askTutorPath = "/api/tutor/ask" as const;

export const tutorApiIsoDateTimeSchema = z
  .string()
  .datetime({
    offset: true,
  })
  .describe("ISO 8601 timestamp with offset.");

export const tutorApiIdSchema = z
  .string()
  .uuid()
  .describe("Stable Avora identifier.");

export const tutorApiNullableIdSchema = tutorApiIdSchema.nullable();

export const tutorApiQuestionSchema = z
  .string()
  .trim()
  .min(1)
  .max(8_000)
  .describe("Student-authored tutor question.");

export const tutorApiScopeSchema = z
  .object({
    termId: tutorApiNullableIdSchema,
    subjectId: tutorApiNullableIdSchema,
    structureUnitId: tutorApiNullableIdSchema,
    resourceId: tutorApiNullableIdSchema,
  })
  .strict();

export const askTutorRequestBodySchema = z
  .object({
    conversationId: tutorApiNullableIdSchema,
    messageId: tutorApiIdSchema,
    question: tutorApiQuestionSchema,
    scope: tutorApiScopeSchema,
    depth: z.enum(tutorExplanationDepths),
    answerFormat: z.enum(tutorAnswerFormats),
    language: z.enum(tutorAnswerLanguages),
  })
  .strict();

export const tutorApiLocatorSchema = z
  .object({
    kind: z.enum([
      "document_page",
      "slide",
      "image_region",
      "audio_time_range",
      "video_time_range",
      "text_span",
      "unknown",
    ]),
    pageNumber: z.number().int().positive().nullable(),
    slideNumber: z.number().int().positive().nullable(),
    boundingBox: z
      .object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
        unit: z.enum(["ratio", "point", "pixel"]),
      })
      .strict()
      .nullable(),
    textSpan: z
      .object({
        startOffset: z.number().int().nonnegative(),
        endOffset: z.number().int().nonnegative(),
      })
      .strict()
      .nullable(),
    timeRange: z
      .object({
        startSeconds: z.number().nonnegative(),
        endSeconds: z.number().nonnegative(),
      })
      .strict()
      .nullable(),
    label: z.string().min(1).nullable(),
  })
  .strict();

export const tutorApiCitationSchema = z
  .object({
    citationId: tutorApiIdSchema,
    chunkId: tutorApiIdSchema,
    resourceId: tutorApiIdSchema,
    locator: tutorApiLocatorSchema,
    quote: z.string().trim().min(1),
  })
  .strict();

export const tutorApiEvidenceSchema = z
  .object({
    chunkId: tutorApiIdSchema,
    resourceId: tutorApiIdSchema,
    extractionDocumentId: tutorApiIdSchema,
    sourceBlockIds: z.array(tutorApiIdSchema).readonly(),
    locator: tutorApiLocatorSchema,
    contentKind: z.enum([
      "heading",
      "paragraph",
      "list",
      "table",
      "formula",
      "code",
      "figure",
      "diagram",
      "transcript",
      "metadata",
      "mixed",
      "unknown",
    ]),
    text: z.string(),
    sortOrder: z.number().int().nonnegative(),
  })
  .strict();

export const tutorApiGroundedContextEnvelopeSchema = z
  .object({
    version: z.literal("grounded-context-envelope.v1"),
    allowedChunkIds: z.array(tutorApiIdSchema).readonly(),
    evidence: z.array(tutorApiEvidenceSchema).readonly(),
  })
  .strict();

export const tutorApiAnsweredResponseBodySchema = z
  .object({
    status: z.literal("answered"),
    answerMessageId: tutorApiIdSchema,
    answerText: z.string().trim().min(1),
    citations: z.array(tutorApiCitationSchema).readonly(),
    context: tutorApiGroundedContextEnvelopeSchema,
    createdAt: tutorApiIsoDateTimeSchema,
  })
  .strict();

export const tutorApiInsufficiencyReasonSchema = z.enum([
  "retrieval_insufficient",
  "grounded_context_empty",
]);

export const tutorApiRetrievalInsufficiencySchema = z
  .object({
    reason: z.enum([
      "no_scoped_context",
      "insufficient_scoped_context",
    ]),
    availableChunkCount: z.number().int().nonnegative(),
    requiredChunkCount: z.number().int().positive(),
  })
  .strict();

export const tutorApiInsufficientContextResponseBodySchema = z
  .object({
    status: z.literal("insufficient_context"),
    reason: tutorApiInsufficiencyReasonSchema,
    message: z.string().trim().min(1),
    retrieval: tutorApiRetrievalInsufficiencySchema.nullable(),
  })
  .strict();

export const tutorApiRefusalReasonSchema = z.enum([
  "ungrounded_answer_blocked",
  "citation_validation_failed",
  "unsupported_request",
]);

export const tutorApiRefusedResponseBodySchema = z
  .object({
    status: z.literal("refused"),
    reason: tutorApiRefusalReasonSchema,
    message: z.string().trim().min(1),
  })
  .strict();

export const askTutorResponseBodySchema = z.discriminatedUnion("status", [
  tutorApiAnsweredResponseBodySchema,
  tutorApiInsufficientContextResponseBodySchema,
  tutorApiRefusedResponseBodySchema,
]);

export const tutorApiErrorCodes = [
  "tutor_api_unauthenticated",
  "tutor_api_invalid_request",
  "tutor_api_unavailable",
] as const;

export const tutorApiErrorCodeSchema = z.enum(tutorApiErrorCodes);

export const tutorApiErrorResponseBodySchema = z
  .object({
    error: tutorApiErrorCodeSchema,
    message: z.string().min(1),
  })
  .strict();

export const askTutorContract = {
  method: "POST",
  path: askTutorPath,
  requestBody: askTutorRequestBodySchema,
  responseBody: askTutorResponseBodySchema,
  errorResponseBody: tutorApiErrorResponseBodySchema,
} as const;

export type TutorApiScope = z.infer<typeof tutorApiScopeSchema>;

export type AskTutorRequestBody = z.input<typeof askTutorRequestBodySchema>;

export type AskTutorParsedRequestBody = z.output<typeof askTutorRequestBodySchema>;

export type TutorApiLocator = z.infer<typeof tutorApiLocatorSchema>;

export type TutorApiCitation = z.infer<typeof tutorApiCitationSchema>;

export type TutorApiEvidence = z.infer<typeof tutorApiEvidenceSchema>;

export type TutorApiGroundedContextEnvelope = z.infer<
  typeof tutorApiGroundedContextEnvelopeSchema
>;

export type TutorApiAnsweredResponseBody = z.infer<
  typeof tutorApiAnsweredResponseBodySchema
>;

export type TutorApiInsufficiencyReason = z.infer<
  typeof tutorApiInsufficiencyReasonSchema
>;

export type TutorApiRetrievalInsufficiency = z.infer<
  typeof tutorApiRetrievalInsufficiencySchema
>;

export type TutorApiInsufficientContextResponseBody = z.infer<
  typeof tutorApiInsufficientContextResponseBodySchema
>;

export type TutorApiRefusalReason = z.infer<typeof tutorApiRefusalReasonSchema>;

export type TutorApiRefusedResponseBody = z.infer<
  typeof tutorApiRefusedResponseBodySchema
>;

export type AskTutorResponseBody = z.infer<typeof askTutorResponseBodySchema>;

export type TutorApiErrorCode = z.infer<typeof tutorApiErrorCodeSchema>;

export type TutorApiErrorResponseBody = z.infer<
  typeof tutorApiErrorResponseBodySchema
>;

export type AskTutorContract = typeof askTutorContract;