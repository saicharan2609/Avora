import { TutorGatewayError, TutorQueryError } from "@avora/ai/gateway/tutor";
import type {
  TutorApiErrorCode,
} from "@avora/core/contracts/tutor";

import { WebTutorAuthenticationError } from "./auth";

export type WebTutorApiErrorStatus = 400 | 401 | 503;

export type WebTutorApiError = Readonly<{
  status: WebTutorApiErrorStatus;
  code: TutorApiErrorCode;
  message: string;
}>;

export function createInvalidTutorRequestError(message: string): WebTutorApiError {
  return {
    status: 400,
    code: "tutor_api_invalid_request",
    message,
  };
}

export function createUnauthenticatedTutorError(): WebTutorApiError {
  return {
    status: 401,
    code: "tutor_api_unauthenticated",
    message: "Authentication is required to ask a tutor question.",
  };
}

export function mapTutorApiError(error: unknown): WebTutorApiError {
  if (error instanceof WebTutorAuthenticationError) {
    return createUnauthenticatedTutorError();
  }

  if (error instanceof TutorQueryError) {
    return createInvalidTutorRequestError(error.message);
  }

  if (error instanceof TutorGatewayError) {
    return {
      status: 503,
      code: "tutor_api_unavailable",
      message: "Tutor answers are currently unavailable.",
    };
  }

  return {
    status: 503,
    code: "tutor_api_unavailable",
    message: "Tutor API is currently unavailable.",
  };
}