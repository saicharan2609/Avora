import type {
  TutorGatewayResponse,
  TutorQuery,
} from "@avora/ai/gateway/tutor";
import type {
  AskTutorParsedRequestBody,
  AskTutorResponseBody,
} from "@avora/core/contracts/tutor";
import type {
  ConversationId,
  MessageId,
  ResourceId,
  StudentId,
} from "@avora/core/identity";
import type {
  IsoDateTimeString,
} from "@avora/core/time";

export function mapAskTutorRequestToTutorQuery(input: Readonly<{
  body: AskTutorParsedRequestBody;
  studentId: StudentId;
  createdAt: IsoDateTimeString;
}>): TutorQuery {
  return {
    studentId: input.studentId,
    conversationId:
      input.body.conversationId === null
        ? null
        : input.body.conversationId as ConversationId,
    messageId: input.body.messageId as MessageId,
    question: input.body.question,
    scope: {
      termId: input.body.scope.termId,
      subjectId: input.body.scope.subjectId,
      structureUnitId: input.body.scope.structureUnitId,
      resourceId:
        input.body.scope.resourceId === null
          ? null
          : input.body.scope.resourceId as ResourceId,
    },
    depth: input.body.depth,
    answerFormat: input.body.answerFormat,
    language: input.body.language,
    createdAt: input.createdAt,
  };
}

export function serializeTutorGatewayResponse(
  response: TutorGatewayResponse,
): AskTutorResponseBody {
  if (response.status === "answered") {
    return {
      status: "answered",
      answerMessageId: response.answerMessageId,
      answerText: response.answerText,
      citations: response.citations.map((citation) => ({
        citationId: citation.citationId,
        chunkId: citation.chunkId,
        resourceId: citation.resourceId,
        locator: citation.locator,
        quote: citation.quote,
      })),
      context: {
        version: response.context.version,
        allowedChunkIds: response.context.allowedChunkIds,
        evidence: response.context.evidence.map((chunk) => ({
          chunkId: chunk.chunkId,
          resourceId: chunk.resourceId,
          extractionDocumentId: chunk.extractionDocumentId,
          sourceBlockIds: chunk.sourceBlockIds,
          locator: chunk.locator,
          contentKind: chunk.contentKind,
          text: chunk.text,
          sortOrder: chunk.sortOrder,
        })),
      },
      createdAt: response.createdAt,
    };
  }

  if (response.status === "insufficient_context") {
    return {
      status: "insufficient_context",
      reason: response.reason,
      message: response.message,
      retrieval:
        response.retrieval === null
          ? null
          : {
              reason: response.retrieval.reason,
              availableChunkCount: response.retrieval.availableChunkCount,
              requiredChunkCount: response.retrieval.requiredChunkCount,
            },
    };
  }

  return {
    status: "refused",
    reason: response.reason,
    message: response.message,
  };
}