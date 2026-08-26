export type GeminiSummaryAdapterErrorCode =
  | "gemini_summary_adapter_invocation_not_authorized"
  | "gemini_summary_adapter_budget_not_authorized"
  | "gemini_summary_adapter_provider_call_failed"
  | "gemini_summary_adapter_empty_response"
  | "gemini_summary_adapter_malformed_json_response"
  | "gemini_summary_adapter_output_contract_invalid"
  | "gemini_summary_adapter_citation_resolution_failed";

export class GeminiSummaryAdapterError extends Error {
  public readonly code: GeminiSummaryAdapterErrorCode;

  public constructor(
    code: GeminiSummaryAdapterErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "GeminiSummaryAdapterError";
    this.code = code;
  }
}
