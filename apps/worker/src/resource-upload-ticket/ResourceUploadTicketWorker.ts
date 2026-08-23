import type {
  ClaimedDbResourceUploadTicketJobRecord,
  DbResourceUploadTicketJobResult,
  ResourceUploadTicketJobsRepository,
} from "@avora/db/repositories/resource-upload-ticket-jobs";
import type { SupabaseStorageAdapter } from "@avora/adapters/supabase/storage";

export type ResourceUploadTicketWorker = Readonly<{
  runOnce: () => Promise<"claimed" | "idle">;
}>;

export type ResourceUploadTicketClaimLoopOptions = Readonly<{
  limit: number;
  staleClaimThresholdSeconds: number;
}>;

export type CreateResourceUploadTicketWorkerInput = Readonly<{
  repository: ResourceUploadTicketJobsRepository;
  blobStore: SupabaseStorageAdapter;
  options?: Partial<ResourceUploadTicketClaimLoopOptions>;
  workerId: string;
}>;

const defaultClaimOptions: ResourceUploadTicketClaimLoopOptions = {
  limit: 1,
  staleClaimThresholdSeconds: 120,
};

// This is the only worker-plane consumer of BlobStorePort.createUploadTicket
// for the resource-upload flow. It exists specifically so that apps/web
// never needs a service-role Supabase Storage client (SEC-005, AD-11).
export function createResourceUploadTicketWorker(
  input: CreateResourceUploadTicketWorkerInput,
): ResourceUploadTicketWorker {
  const options = {
    ...defaultClaimOptions,
    ...input.options,
  };

  return {
    runOnce: async (): Promise<"claimed" | "idle"> => {
      const claimedJobs = await input.repository.claimQueuedResourceUploadTicketJobs({
        workerId: input.workerId,
        limit: options.limit,
        staleClaimThresholdSeconds: options.staleClaimThresholdSeconds,
      });

      const job = claimedJobs[0];

      if (job === undefined) {
        return "idle";
      }

      try {
        const result = await createTicketResult(input.blobStore, job);

        await input.repository.completeResourceUploadTicketJob({
          jobId: job.jobId,
          workerId: input.workerId,
          result,
        });
      } catch (error) {
        await input.repository.failResourceUploadTicketJob({
          jobId: job.jobId,
          workerId: input.workerId,
          errorMessage:
            error instanceof Error ? error.message : "Resource upload ticket creation failed.",
        });
      }

      return "claimed";
    },
  };
}

async function createTicketResult(
  blobStore: SupabaseStorageAdapter,
  job: ClaimedDbResourceUploadTicketJobRecord,
): Promise<DbResourceUploadTicketJobResult> {
  const ticket = await blobStore.createUploadTicket({
    studentId: job.payload.studentId,
    resourceId: job.payload.resourceId,
    bucket: job.payload.bucket,
    objectPath: job.payload.objectPath,
    byteSize: job.payload.byteSize,
    declaredMimeType: job.payload.declaredMimeType,
  });

  return {
    storage: {
      bucket: ticket.storage.bucket as "quarantine",
      objectPath: ticket.storage.objectPath,
      version: ticket.storage.version,
    },
    uploadUrl: ticket.uploadUrl,
    expiresAt: ticket.expiresAt,
  };
}
