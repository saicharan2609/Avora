import { createSupabaseStorageInspectionAdapter } from "@avora/adapters/supabase/storage";
import { createServiceRoleDatabaseClient } from "@avora/db/client";
import { createResourceIngestionJobsRepository } from "@avora/db/repositories/jobs";
import { createResourceExtractionJobsRepository } from "@avora/db/repositories/resource-extraction-jobs";
import { createResourceExtractionRepository } from "@avora/db/repositories/extraction";
import { createResourcesRepository } from "@avora/db/repositories/resources";
import {
  createResourceIngestionValidationService,
  createResourceExtractionService,
  ResourceExtractionServiceError,
} from "@avora/domain/resources";
import type { ResourceExtractionPort, ResourceExtractionRequest, ResourceExtractionResult } from "@avora/domain/resources";

import { createResourceIngestionValidationHandler } from "../resource-ingestion/ResourceIngestionValidationHandler.js";
import {
  createResourceIngestionWorker,
  type ResourceIngestionWorker,
} from "../resource-ingestion/ResourceIngestionWorker.js";
import {
  createResourceExtractionJobHandlerAdapter,
  createResourceExtractionWorker,
  createResourceExtractionWorkerHandler,
  type ResourceExtractionWorker,
} from "../resource-extraction/index.js";

export type WorkerRuntimeEnvironment = Readonly<{
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  workerId: string;
}>;

export type WorkerRuntime = Readonly<{
  resourceIngestionWorker: ResourceIngestionWorker;
  resourceExtractionWorker: ResourceExtractionWorker;
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

  const resourceExtractionJobsRepository = createResourceExtractionJobsRepository({
    client: database.client,
  });

  const extractionRepository = createResourceExtractionRepository({
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

  const extractionService = createResourceExtractionService({
    extractor: createUnavailableExtractionPort(),
  });

  const extractionWorkerHandler = createResourceExtractionWorkerHandler({
    extractionService,
    extractionRepository,
    resourcesRepository,
  });

  return {
    resourceIngestionWorker: createResourceIngestionWorker({
      repository: resourceIngestionJobsRepository,
      handler: createResourceIngestionValidationHandler({
        validationService,
      }),
      workerId: environment.workerId,
    }),
    resourceExtractionWorker: createResourceExtractionWorker({
      repository: resourceExtractionJobsRepository,
      handler: createResourceExtractionJobHandlerAdapter({
        extractionWorkerHandler,
      }),
      workerId: environment.workerId,
    }),
  };
}

function createUnavailableExtractionPort(): ResourceExtractionPort {
  return {
    extractResourceContent: (
      _input: ResourceExtractionRequest,
    ): Promise<ResourceExtractionResult> => {
      throw new ResourceExtractionServiceError(
        "resource_extraction_port_failed",
        "Extraction provider is not configured for the worker runtime.",
      );
    },
  };
}

function readRequiredEnvironmentValue(name: string): string {
  const value = process.env[name];

  if (value === undefined || value.length === 0) {
    throw new Error(`Missing required worker environment variable: ${name}`);
  }

  return value;
}