import type {
  RetrievalInsufficiency,
} from "@avora/retrieval/insufficiency";

import type {
  TutorQuery,
} from "./TutorQuery.js";

export type AIInsufficiencyResponseReason =
  | "retrieval_insufficient"
  | "grounded_context_empty";

export type AIInsufficiencyResponse = Readonly<{
  status: "insufficient_context";
  reason: AIInsufficiencyResponseReason;
  query: TutorQuery;
  retrieval: RetrievalInsufficiency | null;
  message: string;
}>;

export type CreateAIInsufficiencyResponseInput = Readonly<{
  query: TutorQuery;
  retrieval: RetrievalInsufficiency | null;
}>;

export function createAIInsufficiencyResponse(
  input: CreateAIInsufficiencyResponseInput,
): AIInsufficiencyResponse {
  return {
    status: "insufficient_context",
    reason: input.retrieval === null
      ? "grounded_context_empty"
      : "retrieval_insufficient",
    query: input.query,
    retrieval: input.retrieval,
    message:
      "I do not have enough grounded context from your materials to answer this reliably.",
  };
}