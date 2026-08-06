import { createSupabaseStorageAdapter } from "@avora/adapters/supabase/storage";
import { createStudentDatabaseClient } from "@avora/db/client";
import { createResourcesRepository } from "@avora/db/repositories/resources";
import { createResourceUploadService } from "@avora/domain/resources";

import type { AuthenticatedStudent } from "./authenticated-student";
import { createWebResourceIngestionQueue } from "./resource-ingestion-queue";
import {
  createWebResourceUploadOrchestrator,
  type WebResourceUploadOrchestrator,
} from "./resource-upload-orchestrator";

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

export function createWebResourceUploadComposition(input: Readonly<{
  environment: WebResourceUploadEnvironment;
  authenticatedStudent: AuthenticatedStudent;
}>): WebResourceUploadOrchestrator {
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

  const uploadService = createResourceUploadService({
    repository,
    blobStore,
  });

  const ingestionQueue = createWebResourceIngestionQueue();

  return createWebResourceUploadOrchestrator({
    uploadService,
    ingestionQueue,
  });
}

function readRequiredEnvironmentValue(name: string): string {
  const value = process.env[name];

  if (value === undefined || value.length === 0) {
    throw new Error(`Missing required web resource upload environment variable: ${name}`);
  }

  return value;
}