import type { ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";
import type {
  CompleteResourceUploadInput,
  CompleteResourceUploadResult,
  DeclareResourceUploadInput,
  DeclareResourceUploadResult,
  ResourceIngestionQueuePort,
  ResourceUploadService,
} from "@avora/domain/resources";

export type WebDeclareResourceUploadInput = DeclareResourceUploadInput;

export type WebDeclareResourceUploadResult = DeclareResourceUploadResult;

export type WebCompleteResourceUploadInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  contentHash: string;
}>;

export type WebCompleteResourceUploadResult = CompleteResourceUploadResult;

export type WebResourceUploadOrchestrator = Readonly<{
  declareUpload: (input: WebDeclareResourceUploadInput) => Promise<WebDeclareResourceUploadResult>;
  completeUpload: (input: WebCompleteResourceUploadInput) => Promise<WebCompleteResourceUploadResult>;
}>;

export type WebResourceUploadOrchestratorDependencies = Readonly<{
  uploadService: ResourceUploadService;
  ingestionQueue: ResourceIngestionQueuePort;
}>;

export function createWebResourceUploadOrchestrator(
  dependencies: WebResourceUploadOrchestratorDependencies,
): WebResourceUploadOrchestrator {
  return {
    declareUpload: async (
      input: WebDeclareResourceUploadInput,
    ): Promise<WebDeclareResourceUploadResult> => {
      return dependencies.uploadService.declareUpload(input);
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
  };
}