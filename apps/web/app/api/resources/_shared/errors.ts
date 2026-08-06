import { ResourceUploadServiceError } from "@avora/domain/resources";
import { ResourcesRepositoryError } from "@avora/db/repositories/resources";
import { SupabaseStorageAdapterError } from "@avora/adapters/supabase/storage";

import type { ResourceUploadApiErrorCode } from "@avora/core/contracts/resources";

import { WebResourceAuthenticationError } from "./authenticated-student";

export type WebResourceApiErrorStatus = 400 | 401 | 403 | 404 | 409 | 413 | 503;

export type WebResourceApiError = Readonly<{
  status: WebResourceApiErrorStatus;
  code: ResourceUploadApiErrorCode;
  message: string;
}>;

export function createInvalidRequestError(message: string): WebResourceApiError {
  return {
    status: 400,
    code: "resource_upload_invalid_request",
    message,
  };
}

export function createUnauthenticatedError(): WebResourceApiError {
  return {
    status: 401,
    code: "resource_upload_unauthenticated",
    message: "Authentication is required to upload a resource.",
  };
}

export function mapResourceUploadError(error: unknown): WebResourceApiError {
  if (error instanceof WebResourceAuthenticationError) {
    return createUnauthenticatedError();
  }

  if (error instanceof ResourceUploadServiceError) {
    if (error.code === "resource_upload_invalid_byte_size") {
      return {
        status: 413,
        code: "resource_upload_limit_exceeded",
        message: error.message,
      };
    }

    return {
      status: 400,
      code: "resource_upload_invalid_request",
      message: error.message,
    };
  }

  if (error instanceof ResourcesRepositoryError) {
    if (error.code === "resources_repository_missing_completed_resource") {
      return {
        status: 404,
        code: "resource_upload_not_found",
        message: "No pending upload matched the requested resource.",
      };
    }

    return {
      status: 503,
      code: "resource_upload_unavailable",
      message: "Resource persistence is currently unavailable.",
    };
  }

  if (error instanceof SupabaseStorageAdapterError) {
    return {
      status: 503,
      code: "resource_upload_unavailable",
      message: "Resource storage is currently unavailable.",
    };
  }

  return {
    status: 503,
    code: "resource_upload_unavailable",
    message: "Resource upload is currently unavailable.",
  };
}