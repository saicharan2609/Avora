export type TutorGatewayErrorCode =
  | "tutor_gateway_provider_invocation_failed";

export class TutorGatewayError extends Error {
  public readonly code: TutorGatewayErrorCode;

  public constructor(
    code: TutorGatewayErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "TutorGatewayError";
    this.code = code;
  }
}