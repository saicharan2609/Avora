import { createResourcePlacementRepositoryPortAdapter } from "@avora/adapters/resource-placement";
import { createStudentDatabaseClient } from "@avora/db/client";
import { createResourcePlacementRepository } from "@avora/db/repositories/placement";
import {
  createResourcePlacementService,
  type ResourcePlacementService,
} from "@avora/domain/resources";

import type { AuthenticatedStudent } from "./authenticated-student";

export type WebResourcePlacementEnvironment = Readonly<{
  supabaseUrl: string;
  supabaseAnonKey: string;
}>;

export function readWebResourcePlacementEnvironment(): WebResourcePlacementEnvironment {
  return {
    supabaseUrl: readRequiredEnvironmentValue("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: readRequiredEnvironmentValue("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}

export function createWebResourcePlacementService(input: Readonly<{
  environment: WebResourcePlacementEnvironment;
  authenticatedStudent: AuthenticatedStudent;
}>): ResourcePlacementService {
  const studentDatabase = createStudentDatabaseClient({
    supabaseUrl: input.environment.supabaseUrl,
    supabaseAnonKey: input.environment.supabaseAnonKey,
    accessToken: input.authenticatedStudent.accessToken,
  });

  const dbPlacementRepository = createResourcePlacementRepository({
    client: studentDatabase.client,
  });

  const placementRepository = createResourcePlacementRepositoryPortAdapter({
    repository: dbPlacementRepository,
  });

  return createResourcePlacementService({
    repository: placementRepository,
  });
}

function readRequiredEnvironmentValue(name: string): string {
  const value = process.env[name];

  if (value === undefined || value.length === 0) {
    throw new Error(`Missing required web resource placement environment variable: ${name}`);
  }

  return value;
}