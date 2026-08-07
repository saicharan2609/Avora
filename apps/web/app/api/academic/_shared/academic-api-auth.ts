import type { StudentId } from "@avora/core/identity";
import { createStudentDatabaseClient } from "@avora/db/client";
import type { DatabaseClient } from "@avora/db/client";
import type { NextRequest } from "next/server";

export type AuthenticatedAcademicApiStudent = Readonly<{
  accessToken: string;
  studentId: StudentId;
  client: DatabaseClient;
}>;

const bearerPrefix = "Bearer ";

const accessTokenCookieCandidates = [
  "avora_access_token",
  "avora_session",
  "sb-access-token",
] as const;

export async function resolveAuthenticatedAcademicApiStudent(
  request: NextRequest,
): Promise<AuthenticatedAcademicApiStudent | null> {
  const accessToken = readAccessToken(request);

  if (accessToken === null) {
    return null;
  }

const database = createStudentDatabaseClient({
  supabaseUrl: readRequiredEnvironmentValue("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: readRequiredEnvironmentValue("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  accessToken,
});

  const { data, error } = await database.client.auth.getUser(accessToken);

  if (error !== null || data.user === null) {
    return null;
  }

  return {
    accessToken,
    studentId: data.user.id as StudentId,
    client: database.client,
  };
}

function readAccessToken(request: NextRequest): string | null {
  const authorization = request.headers.get("authorization");

  if (authorization !== null && authorization.startsWith(bearerPrefix)) {
    const token = authorization.slice(bearerPrefix.length).trim();

    if (token.length > 0) {
      return token;
    }
  }

  for (const cookieName of accessTokenCookieCandidates) {
    const cookieValue = request.cookies.get(cookieName)?.value;

    if (cookieValue !== undefined && cookieValue.length > 0) {
      return cookieValue;
    }
  }

  return null;
}
function readRequiredEnvironmentValue(name: string): string {
  const value = process.env[name];

  if (value === undefined || value.length === 0) {
    throw new Error(
      `Missing required web academic api environment variable: ${name}`,
    );
  }

  return value;
}