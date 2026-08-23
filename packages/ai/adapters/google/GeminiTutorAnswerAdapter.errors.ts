export type GeminiTutorAnswerAdapterErrorCode =
  | "gemini_tutor_answer_adapter_invocation_not_authorized"
  | "gemini_tutor_answer_adapter_budget_not_authorized"
  | "gemini_tutor_answer_adapter_provider_call_failed"
  | "gemini_tutor_answer_adapter_empty_response"
  | "gemini_tutor_answer_adapter_malformed_json_response"
  | "gemini_tutor_answer_adapter_output_contract_invalid"
  | "gemini_tutor_answer_adapter_citation_resolution_failed";

export class GeminiTutorAnswerAdapterError extends Error {
  public readonly code: GeminiTutorAnswerAdapterErrorCode;

  public constructor(
    code: GeminiTutorAnswerAdapterErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "GeminiTutorAnswerAdapterError";
    this.code = code;
  }
}
