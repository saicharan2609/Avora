import type { NextResponse } from "next/server";

import type {
  ResourceProcessingStatusErrorResponseBody,
} from "@avora/core/contracts/resources";

import {
  createJsonResponse,
} from "./json";
import type {
  WebResourceProcessingStatusApiError,
} from "./resource-processing-status-errors";

export function createResourceProcessingStatusErrorResponse(
  error: WebResourceProcessingStatusApiError,
): NextResponse<ResourceProcessingStatusErrorResponseBody> {
  return createJsonResponse(
    {
      error: error.code,
      message: error.message,
    },
    error.status,
  );
}