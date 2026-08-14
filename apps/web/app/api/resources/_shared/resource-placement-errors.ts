import type { ResourcePlacementApiErrorCode } from "@avora/core/contracts/resources/placement";
import { ResourcePlacementRepositoryError } from "@avora/db/repositories/placement";
import { ResourcePlacementServiceError } from "@avora/domain/resources";

import {
  WebResourceAuthenticationError,
} from "./authenticated-student";

export type WebResourcePlacementApiErrorStatus = 400 | 401 | 404 | 503;

export type WebResourcePlacementApiError = Readonly<{
  status: WebResourcePlacementApiErrorStatus;
  code: ResourcePlacementApiErrorCode;
  message: string;
}>;

export function createResourcePlacementInvalidRequestError(
  message: string,
): WebResourcePlacementApiError {
  return {
    status: 400,
    code: "resource_placement_invalid_request",
    message,
  };
}

export function createResourcePlacementUnauthenticatedError(): WebResourcePlacementApiError {
  return {
    status: 401,
    code: "resource_placement_unauthenticated",
    message: "Authentication is required to access resource placement.",
  };
}

export function createResourcePlacementNotFoundError(
  message: string,
): WebResourcePlacementApiError {
  return {
    status: 404,
    code: "resource_placement_not_found",
    message,
  };
}

export function mapResourcePlacementError(error: unknown): WebResourcePlacementApiError {
  if (error instanceof WebResourceAuthenticationError) {
    return createResourcePlacementUnauthenticatedError();
  }

  if (error instanceof ResourcePlacementServiceError) {
    if (error.code === "resource_placement_candidate_not_found") {
      return createResourcePlacementNotFoundError(error.message);
    }

    return createResourcePlacementInvalidRequestError(error.message);
  }

  if (error instanceof ResourcePlacementRepositoryError) {
    return {
      status: 503,
      code: "resource_placement_unavailable",
      message: "Resource placement persistence is currently unavailable.",
    };
  }

  return {
    status: 503,
    code: "resource_placement_unavailable",
    message: "Resource placement is currently unavailable.",
  };
}