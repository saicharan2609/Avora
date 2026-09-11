import { createStudentDatabaseClient } from "@avora/db/client";
import { createMobileAuthHandoffsRepository } from "@avora/db/repositories/mobile-auth-handoffs";
import type { SupabaseAuthSession } from "@avora/adapters/supabase/auth";

import { readWebAuthEnvironment } from "./supabase-auth";

export async function createMobileAuthHandoff(session: SupabaseAuthSession): Promise<string> {
  const environment = readWebAuthEnvironment();

  const studentDatabase = createStudentDatabaseClient({
    supabaseUrl: environment.supabaseUrl,
    supabaseAnonKey: environment.supabaseAnonKey,
    accessToken: session.accessToken,
  });

  const handoffs = createMobileAuthHandoffsRepository({
    client: studentDatabase.client,
  });

  return handoffs.createHandoff({
    studentId: session.studentId,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresAt: session.expiresAt,
  });
}
