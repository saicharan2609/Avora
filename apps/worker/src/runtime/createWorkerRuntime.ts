import { createSupabaseStorageInspectionAdapter } from "@avora/adapters/supabase/storage";
import { createServiceRoleDatabaseClient } from "@avora/db/client";
import { createResourceIngestionJobsRepository } from "@avora/db/repositories/jobs";
import { createResourcesRepository } from "@avora/db/repositories/resources";
import { createResourceIngestionValidationService } from "@avora/domain/resources";

import { createResourceIngestionValidationHandler } from "../resource-ingestion/ResourceIngestionValidationHandler.js";
import {
  createResourceIngestionWorker,
  type ResourceIngestionWorker,
} from "../resource-ingestion/ResourceIngestionWorker.js";

export type WorkerRuntimeEnvironment = Readonly<{
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  workerId: string;
}>;

export type WorkerRuntime = Readonly<{
  resourceIngestionWorker: ResourceIngestionWorker;
}>;

export function readWorkerRuntimeEnvironment(): WorkerRuntimeEnvironment {
  return {
    supabaseUrl: readRequiredEnvironmentValue("SUPABASE_URL"),
    supabaseServiceRoleKey: readRequiredEnvironmentValue("SUPABASE_SERVICE_ROLE_KEY"),
    workerId: process.env["AVORA_WORKER_ID"] ?? `worker-${process.pid}`,
  };
}

export function createWorkerRuntime(
  environment: WorkerRuntimeEnvironment,
): WorkerRuntime {
  const database = createServiceRoleDatabaseClient({
    supabaseUrl: environment.supabaseUrl,
    supabaseServiceRoleKey: environment.supabaseServiceRoleKey,
  });

  const resourcesRepository = createResourcesRepository({
    client: database.client,
  });

  const resourceIngestionJobsRepository = createResourceIngestionJobsRepository({
    client: database.client,
  });

  const storageInspection = createSupabaseStorageInspectionAdapter({
    supabaseUrl: environment.supabaseUrl,
    supabaseServiceRoleKey: environment.supabaseServiceRoleKey,
  });

  const validationService = createResourceIngestionValidationService({
    repository: resourcesRepository,
    objectInspection: storageInspection,
  });

  return {
    resourceIngestionWorker: createResourceIngestionWorker({
      repository: resourceIngestionJobsRepository,
      handler: createResourceIngestionValidationHandler({
        validationService,
      }),
      workerId: environment.workerId,
    }),
  };
}

function readRequiredEnvironmentValue(name: string): string {
  const value = process.env[name];

  if (value === undefined || value.length === 0) {
    throw new Error(`Missing required worker environment variable: ${name}`);
  }

  return value;
}