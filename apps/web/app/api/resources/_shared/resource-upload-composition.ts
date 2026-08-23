import { createStudentDatabaseClient } from "@avora/db/client";
import { createResourceIngestionJobsRepository } from "@avora/db/repositories/jobs";
import { createResourcesRepository } from "@avora/db/repositories/resources";
import { createResourceUploadTicketJobsRepository } from "@avora/db/repositories/resource-upload-ticket-jobs";
import { createResourceUploadService } from "@avora/domain/resources";

import type { AuthenticatedStudent } from "./authenticated-student";
import { createWebResourceIngestionQueue } from "./resource-ingestion-queue";
import { createWebResourceUploadTicketQueue } from "./resource-upload-ticket-queue";
import {
  createWebResourceUploadOrchestrator,
  type WebResourceUploadOrchestrator,
} from "./resource-upload-orchestrator";

export type WebResourceUploadEnvironment = Readonly<{
  supabaseUrl: string;
  supabaseAnonKey: string;
}>;

export function readWebResourceUploadEnvironment(): WebResourceUploadEnvironment {
  return {
    supabaseUrl: readRequiredEnvironmentValue("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: readRequiredEnvironmentValue("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
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

  const resourcesRepository = createResourcesRepository({
    client: studentDatabase.client,
  });

  const resourceIngestionJobsRepository = createResourceIngestionJobsRepository({
    client: studentDatabase.client,
  });

  const resourceUploadTicketJobsRepository = createResourceUploadTicketJobsRepository({
    client: studentDatabase.client,
  });

  const uploadService = createResourceUploadService({
    repository: resourcesRepository,
  });

  const ingestionQueue = createWebResourceIngestionQueue({
    repository: resourceIngestionJobsRepository,
  });

  const ticketQueue = createWebResourceUploadTicketQueue({
    repository: resourceUploadTicketJobsRepository,
  });

  return createWebResourceUploadOrchestrator({
    uploadService,
    ingestionQueue,
    ticketQueue,
    getTicketJobStatus: async (input) => {
      const job = await resourceUploadTicketJobsRepository.getResourceUploadTicketJobById({
        studentId: input.studentId,
        jobId: input.jobId,
      });

      if (job === null) {
        return null;
      }

      if (job.status === "succeeded" && job.result !== null) {
        return {
          status: "ready",
          ticket: {
            resourceId: job.resourceId,
            storage: job.result.storage,
            uploadUrl: job.result.uploadUrl,
            expiresAt: job.result.expiresAt,
          },
        };
      }

      if (job.status === "failed" || job.status === "dead_lettered") {
        return {
          status: "failed",
          ticket: null,
        };
      }

      return {
        status: "pending",
        ticket: null,
      };
    },
  });
}

function readRequiredEnvironmentValue(name: string): string {
  const value = process.env[name];

  if (value === undefined || value.length === 0) {
    throw new Error(`Missing required web resource upload environment variable: ${name}`);
  }

  return value;
}
