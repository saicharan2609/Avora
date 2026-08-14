import type { NextRequest } from "next/server";

import type { StudentId } from "@avora/core/identity";
import { createStudentDatabaseClient } from "@avora/db/client";
import type { DatabaseClient } from "@avora/db/client";

import { avoraWebAccessTokenCookieName } from "../../auth/_shared/session-cookie";

export type AuthenticatedTutorApiStudent = Readonly<{
  studentId: StudentId;
  accessToken: string;
  client: DatabaseClient;
}>;

export type WebTutorApiEnvironment = Readonly<{
  supabaseUrl: string;
  supabaseAnonKey: string;
}>;

export class WebTutorAuthenticationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "WebTutorAuthenticationError";
  }
}

export async function resolveAuthenticatedTutorApiStudent(input: Readonly<{
  request: NextRequest;
  environment: WebTutorApiEnvironment;
}>): Promise<AuthenticatedTutorApiStudent> {
  const accessToken = input.request.cookies.get(avoraWebAccessTokenCookieName)?.value;

  if (accessToken === undefined || accessToken.length === 0) {
    throw new WebTutorAuthenticationError("Missing authenticated web session");
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
    throw new WebTutorAuthenticationError(error.message);
  }

  if (data === null || data.student_id.length === 0) {
    throw new WebTutorAuthenticationError("Authenticated session has no student row");
  }

  return {
    studentId: data.student_id as StudentId,
    accessToken,
    client: studentDatabase.client,
  };
}