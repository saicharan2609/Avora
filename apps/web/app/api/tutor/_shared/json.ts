import { NextResponse } from "next/server";
import type { ZodError } from "zod";

import type {
  TutorApiErrorResponseBody,
} from "@avora/core/contracts/tutor";

import type {
  WebTutorApiError,
} from "./errors";

export function createJsonResponse<TBody>(
  body: TBody,
  status: number,
): NextResponse<TBody> {
  return NextResponse.json(body, {
    status,
  });
}

export function createTutorErrorResponse(
  error: WebTutorApiError,
): NextResponse<TutorApiErrorResponseBody> {
  return createJsonResponse(
    {
      error: error.code,
      message: error.message,
    },
    error.status,
  );
}

export function formatZodError(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length === 0 ? "body" : issue.path.join(".");
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}