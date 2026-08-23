import type { JobId, ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";
import type {
  CompleteResourceUploadInput,
  CompleteResourceUploadResult,
  DeclareResourceUploadInput,
  DeclareResourceUploadResult,
  ResourceIngestionQueuePort,
  ResourceUploadService,
  ResourceUploadTicket,
  ResourceUploadTicketJobAccepted,
  ResourceUploadTicketQueuePort,
} from "@avora/domain/resources";
import {
  resourceUploadTicketJobName,
} from "@avora/domain/resources";

export type WebDeclareResourceUploadInput = DeclareResourceUploadInput;

export type WebDeclareResourceUploadResult = Readonly<{
  result: DeclareResourceUploadResult;
  ticketJob: ResourceUploadTicketJobAccepted;
}>;

export type WebCompleteResourceUploadInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  contentHash: string;
}>;

export type WebCompleteResourceUploadResult = CompleteResourceUploadResult;

export type WebResourceUploadTicketJobStatus = "pending" | "ready" | "failed";

export type WebGetResourceUploadTicketInput = Readonly<{
  studentId: StudentId;
  jobId: JobId;
}>;

export type WebGetResourceUploadTicketResult = Readonly<{
  status: WebResourceUploadTicketJobStatus;
  ticket: ResourceUploadTicket | null;
}>;

export type WebResourceUploadOrchestrator = Readonly<{
  declareUpload: (input: WebDeclareResourceUploadInput) => Promise<WebDeclareResourceUploadResult>;
  completeUpload: (input: WebCompleteResourceUploadInput) => Promise<WebCompleteResourceUploadResult>;
  getTicket: (input: WebGetResourceUploadTicketInput) => Promise<WebGetResourceUploadTicketResult>;
}>;

export type WebResourceUploadOrchestratorDependencies = Readonly<{
  uploadService: ResourceUploadService;
  ingestionQueue: ResourceIngestionQueuePort;
  ticketQueue: ResourceUploadTicketQueuePort;
  getTicketJobStatus: (
    input: WebGetResourceUploadTicketInput,
  ) => Promise<WebGetResourceUploadTicketResult | null>;
}>;

export function createWebResourceUploadOrchestrator(
  dependencies: WebResourceUploadOrchestratorDependencies,
): WebResourceUploadOrchestrator {
  return {
    declareUpload: async (
      input: WebDeclareResourceUploadInput,
    ): Promise<WebDeclareResourceUploadResult> => {
      const result = await dependencies.uploadService.declareUpload(input);

      const ticketJob = await dependencies.ticketQueue.enqueueResourceUploadTicket({
        name: resourceUploadTicketJobName,
        reason: "upload_declared",
        priority: "interactive",
        payload: {
          studentId: result.resource.studentId,
          resourceId: result.resource.resourceId,
          bucket: "quarantine",
          objectPath: result.resource.storage.objectPath,
          version: result.resource.storage.version,
          byteSize: result.resource.byteSize,
          declaredMimeType: result.resource.declaredMimeType,
        },
      });

      return {
        result,
        ticketJob,
      };
    },

    completeUpload: async (
      input: WebCompleteResourceUploadInput,
    ): Promise<WebCompleteResourceUploadResult> => {
      const result = await dependencies.uploadService.completeUpload({
        studentId: input.studentId,
        resourceId: input.resourceId,
        contentHash: input.contentHash,
      } satisfies CompleteResourceUploadInput);

      await dependencies.ingestionQueue.enqueueResourceIngestion({
        name: "resources.ingestion.requested",
        reason: "upload_completed",
        priority: "normal",
        payload: {
          studentId: result.resource.studentId,
          resourceId: result.resource.resourceId,
          storage: result.resource.storage,
          declaredMimeType: result.resource.declaredMimeType,
          byteSize: result.resource.byteSize,
          contentHash: result.resource.contentHash ?? input.contentHash.trim().toLowerCase(),
          requestedAt: new Date().toISOString() as IsoDateTimeString,
        },
      });

      return result;
    },

    getTicket: async (
      input: WebGetResourceUploadTicketInput,
    ): Promise<WebGetResourceUploadTicketResult> => {
      const status = await dependencies.getTicketJobStatus(input);

      if (status === null) {
        throw new WebResourceUploadTicketNotFoundError(
          "No upload-ticket job matched the requested job id.",
        );
      }

      return status;
    },
  };
}

export class WebResourceUploadTicketNotFoundError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "WebResourceUploadTicketNotFoundError";
  }
}