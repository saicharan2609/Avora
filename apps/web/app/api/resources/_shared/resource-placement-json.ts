import type { NextResponse } from "next/server";

import type {
  ResourcePlacementApiErrorResponseBody,
} from "@avora/core/contracts/resources/placement";

import { createJsonResponse } from "./json";
import type { WebResourcePlacementApiError } from "./resource-placement-errors";

export function createResourcePlacementErrorResponse(
  error: WebResourcePlacementApiError,
): NextResponse<ResourcePlacementApiErrorResponseBody> {
  return createJsonResponse(
    {
      error: error.code,
      message: error.message,
    },
    error.status,
  );
}