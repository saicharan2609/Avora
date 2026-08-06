import { createSupabaseStorageAdapter } from "@avora/adapters/supabase/storage";
import { createResourceUploadService } from "@avora/domain/resources";
import { createResourcesRepository } from "@avora/db/repositories/resources";
import { createStudentDatabaseClient } from "@avora/db/client";

import type { AuthenticatedStudent } from "./authenticated-student";

export type WebResourceUploadEnvironment = Readonly<{
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
}>;

export function readWebResourceUploadEnvironment(): WebResourceUploadEnvironment {
  return {
    supabaseUrl: readRequiredEnvironmentValue("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: readRequiredEnvironmentValue("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    supabaseServiceRoleKey: readRequiredEnvironmentValue("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

export function createWebResourceUploadService(input: Readonly<{
  environment: WebResourceUploadEnvironment;
  authenticatedStudent: AuthenticatedStudent;
}>) {
  const studentDatabase = createStudentDatabaseClient({
    supabaseUrl: input.environment.supabaseUrl,
    supabaseAnonKey: input.environment.supabaseAnonKey,
    accessToken: input.authenticatedStudent.accessToken,
  });

  const repository = createResourcesRepository({
    client: studentDatabase.client,
  });

  const blobStore = createSupabaseStorageAdapter({
    supabaseUrl: input.environment.supabaseUrl,
    supabaseServiceRoleKey: input.environment.supabaseServiceRoleKey,
  });

  return createResourceUploadService({
    repository,
    blobStore,
  });
}

function readRequiredEnvironmentValue(name: string): string {
  const value = process.env[name];

  if (value === undefined || value.length === 0) {
    throw new Error(`Missing required web resource upload environment variable: ${name}`);
  }

  return value;
}