import type {
  ConversationId,
  MessageId,
  StudentId,
} from "@avora/core/identity";
import type {
  IsoDateTimeString,
} from "@avora/core/time";
import type {
  TutorAnswerFormat,
  TutorAnswerLanguage,
  TutorExplanationDepth,
} from "@avora/core/domain-types";
import type {
  ScopedSearchInput,
  ScopedSearchScope,
} from "@avora/retrieval/scope";

export type TutorQuery = Readonly<{
  studentId: StudentId;
  conversationId: ConversationId | null;
  messageId: MessageId;
  question: string;
  scope: ScopedSearchScope;
  depth: TutorExplanationDepth;
  answerFormat: TutorAnswerFormat;
  language: TutorAnswerLanguage;
  createdAt: IsoDateTimeString;
}>;

export type CreateScopedSearchInputFromTutorQueryInput = Readonly<{
  query: TutorQuery;
  maxChunks: number;
  minChunkCount: number;
}>;

export function createScopedSearchInputFromTutorQuery(
  input: CreateScopedSearchInputFromTutorQueryInput,
): ScopedSearchInput {
  if (input.query.question.trim().length === 0) {
    throw new TutorQueryError(
      "tutor_query_invalid_input",
      "Tutor query question must not be empty.",
    );
  }

  if (!Number.isSafeInteger(input.maxChunks) || input.maxChunks <= 0) {
    throw new TutorQueryError(
      "tutor_query_invalid_input",
      "Tutor query maxChunks must be a positive safe integer.",
    );
  }

  if (!Number.isSafeInteger(input.minChunkCount) || input.minChunkCount <= 0) {
    throw new TutorQueryError(
      "tutor_query_invalid_input",
      "Tutor query minChunkCount must be a positive safe integer.",
    );
  }

  return {
    studentId: input.query.studentId,
    query: input.query.question,
    scope: input.query.scope,
    limits: {
      maxChunks: input.maxChunks,
    },
    insufficiency: {
      minChunkCount: input.minChunkCount,
    },
  };
}

export type TutorQueryErrorCode =
  | "tutor_query_invalid_input";

export class TutorQueryError extends Error {
  public readonly code: TutorQueryErrorCode;

  public constructor(code: TutorQueryErrorCode, message: string) {
    super(message);
    this.name = "TutorQueryError";
    this.code = code;
  }
}