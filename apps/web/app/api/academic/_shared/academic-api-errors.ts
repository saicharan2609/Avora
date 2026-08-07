import { NextResponse } from "next/server";

export type AcademicApiErrorCode =
  | "academic_api_invalid_request"
  | "academic_api_unauthorized"
  | "academic_api_internal_error";

export type AcademicApiErrorBody = Readonly<{
  error: Readonly<{
    code: AcademicApiErrorCode;
    message: string;
  }>;
}>;

export function academicApiErrorResponse(
  code: AcademicApiErrorCode,
  message: string,
  status: number,
): NextResponse<AcademicApiErrorBody> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
      },
    },
    {
      status,
    },
  );
}

export function academicApiInvalidRequest(
  message: string,
): NextResponse<AcademicApiErrorBody> {
  return academicApiErrorResponse("academic_api_invalid_request", message, 400);
}

export function academicApiUnauthorized(): NextResponse<AcademicApiErrorBody> {
  return academicApiErrorResponse(
    "academic_api_unauthorized",
    "Authentication is required.",
    401,
  );
}

export function academicApiInternalError(): NextResponse<AcademicApiErrorBody> {
  return academicApiErrorResponse(
    "academic_api_internal_error",
    "Academic setup request could not be completed.",
    500,
  );
}