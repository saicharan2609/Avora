import type { NextRequest } from "next/server";

import type { StudentId } from "@avora/core/identity";
import { createStudentDatabaseClient } from "@avora/db/client";

import { avoraWebAccessTokenCookieName } from "../../auth/_shared/session-cookie";

export type AuthenticatedStudent = Readonly<{
  studentId: StudentId;
  accessToken: string;
}>;

export type WebSupabaseProjectEnvironment = Readonly<{
  supabaseUrl: string;
  supabaseAnonKey: string;
}>;

export class WebResourceAuthenticationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "WebResourceAuthenticationError";
  }
}

export async function resolveAuthenticatedStudent(input: Readonly<{
  request: NextRequest;
  environment: WebSupabaseProjectEnvironment;
}>): Promise<AuthenticatedStudent> {
  const accessToken = input.request.cookies.get(avoraWebAccessTokenCookieName)?.value;

  if (accessToken === undefined || accessToken.length === 0) {
    throw new WebResourceAuthenticationError("Missing authenticated web session");
  }

  const studentDatabase = createStudentDatabaseClient({
    supabaseUrl: input.environment.supabaseUrl,
    supabaseAnonKey: input.environment.supabaseAnonKey,
    accessToken,
  });

  const { data, error } = await studentDatabase.client
    .from("students")
    .select("student_id")
    .single();

  if (error !== null) {
    throw new WebResourceAuthenticationError(error.message);
  }

  if (data === null || data.student_id.length === 0) {
    throw new WebResourceAuthenticationError("Authenticated session has no student row");
  }

  return {
    studentId: data.student_id as StudentId,
    accessToken,
  };
}