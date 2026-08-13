import type {
  MessageId,
} from "@avora/core/identity";
import type {
  IsoDateTimeString,
} from "@avora/core/time";

import type {
  AIInsufficiencyResponse,
} from "./AIInsufficiencyResponse.js";
import type {
  Citation,
} from "./Citation.js";
import type {
  GroundedContextEnvelope,
} from "./GroundedContextEnvelope.js";
import type {
  TutorQuery,
} from "./TutorQuery.js";

export type GroundedAnswerStatus =
  | "answered"
  | "refused"
  | "insufficient_context";

export type AIRefusalReason =
  | "ungrounded_answer_blocked"
  | "citation_validation_failed"
  | "unsupported_request";

export type AIRefusalResponse = Readonly<{
  status: "refused";
  reason: AIRefusalReason;
  query: TutorQuery;
  message: string;
}>;

export type GroundedAnswer = Readonly<{
  status: "answered";
  answerMessageId: MessageId;
  query: TutorQuery;
  context: GroundedContextEnvelope;
  answerText: string;
  citations: readonly Citation[];
  createdAt: IsoDateTimeString;
}>;

export type TutorGatewayResponse =
  | GroundedAnswer
  | AIInsufficiencyResponse
  | AIRefusalResponse;

export type CreateAIRefusalResponseInput = Readonly<{
  query: TutorQuery;
  reason: AIRefusalReason;
  message: string;
}>;

export function createAIRefusalResponse(
  input: CreateAIRefusalResponseInput,
): AIRefusalResponse {
  return {
    status: "refused",
    reason: input.reason,
    query: input.query,
    message: input.message,
  };
}