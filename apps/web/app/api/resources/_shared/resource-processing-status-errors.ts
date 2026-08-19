import { ResourceExtractionRepositoryError } from "@avora/db/repositories/extraction";
import { ResourcesRepositoryError } from "@avora/db/repositories/resources";

import type {
  ResourceProcessingStatusApiErrorCode,
} from "@avora/core/contracts/resources";

import {
  WebResourceAuthenticationError,
} from "./authenticated-student";

export type WebResourceProcessingStatusApiErrorStatus =
  | 400
  | 401
  | 404
  | 503;

export type WebResourceProcessingStatusApiError = Readonly<{
  status: WebResourceProcessingStatusApiErrorStatus;
  code: ResourceProcessingStatusApiErrorCode;
  message: string;
}>;

export class WebResourceProcessingStatusNotFoundError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "WebResourceProcessingStatusNotFoundError";
  }
}

export function createResourceProcessingStatusInvalidRequestError(
  message: string,
): WebResourceProcessingStatusApiError {
  return {
    status: 400,
    code: "resource_processing_status_invalid_request",
    message,
  };
}

export function createResourceProcessingStatusUnauthenticatedError():
  WebResourceProcessingStatusApiError {
  return {
    status: 401,
    code: "resource_processing_status_unauthenticated",
    message: "Authentication is required to read resource processing status.",
  };
}

export function createResourceProcessingStatusNotFoundError():
  WebResourceProcessingStatusApiError {
  return {
    status: 404,
    code: "resource_processing_status_not_found",
    message: "Resource processing status was not found.",
  };
}

export function createResourceProcessingStatusUnavailableError():
  WebResourceProcessingStatusApiError {
  return {
    status: 503,
    code: "resource_processing_status_unavailable",
    message: "Resource processing status is currently unavailable.",
  };
}

export function mapResourceProcessingStatusError(
  error: unknown,
): WebResourceProcessingStatusApiError {
  if (error instanceof WebResourceAuthenticationError) {
    return createResourceProcessingStatusUnauthenticatedError();
  }

  if (error instanceof WebResourceProcessingStatusNotFoundError) {
    return createResourceProcessingStatusNotFoundError();
  }

  if (error instanceof ResourcesRepositoryError) {
    return createResourceProcessingStatusUnavailableError();
  }

  if (error instanceof ResourceExtractionRepositoryError) {
    return createResourceProcessingStatusUnavailableError();
  }

  return createResourceProcessingStatusUnavailableError();
}