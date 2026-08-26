export type SummaryGatewayErrorCode =
  | "summary_gateway_provider_invocation_failed";

export class SummaryGatewayError extends Error {
  public readonly code: SummaryGatewayErrorCode;

  public constructor(
    code: SummaryGatewayErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "SummaryGatewayError";
    this.code = code;
  }
}
