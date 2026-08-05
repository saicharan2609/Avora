import type {
  CompleteResourceUploadInput,
  CompleteResourceUploadResult,
  DeclareResourceUploadInput,
  DeclareResourceUploadResult,
} from "../contracts/ResourceUpload.contract.js";
import type { BlobStorePort } from "../ports/BlobStorePort.js";
import type { ResourceRepositoryPort } from "../repositories/ResourceRepositoryPort.js";

export type ResourceUploadServiceDependencies = Readonly<{
  repository: ResourceRepositoryPort;
  blobStore: BlobStorePort;
}>;

export type ResourceUploadService = Readonly<{
  declareUpload: (input: DeclareResourceUploadInput) => Promise<DeclareResourceUploadResult>;
  completeUpload: (input: CompleteResourceUploadInput) => Promise<CompleteResourceUploadResult>;
}>;

export type ResourceUploadServiceErrorCode =
  | "resource_upload_invalid_filename"
  | "resource_upload_invalid_mime_type"
  | "resource_upload_invalid_byte_size"
  | "resource_upload_invalid_content_hash"
  | "resource_upload_storage_location_mismatch";

export class ResourceUploadServiceError extends Error {
  public readonly code: ResourceUploadServiceErrorCode;

  public constructor(code: ResourceUploadServiceErrorCode, message: string) {
    super(message);
    this.name = "ResourceUploadServiceError";
    this.code = code;
  }
}

export function createResourceUploadService(
  dependencies: ResourceUploadServiceDependencies,
): ResourceUploadService {
  return {
    declareUpload: async (
      input: DeclareResourceUploadInput,
    ): Promise<DeclareResourceUploadResult> => {
      assertValidDeclareUploadInput(input);

      const resource = await dependencies.repository.createPendingUpload({
        studentId: input.studentId,
        kind: input.kind,
        originalFilename: input.originalFilename.trim(),
        declaredMimeType: input.declaredMimeType.trim().toLowerCase(),
        byteSize: input.byteSize,
      });

      const ticket = await dependencies.blobStore.createUploadTicket({
        studentId: resource.studentId,
        resourceId: resource.resourceId,
        bucket: "quarantine",
        objectPath: resource.storage.objectPath,
        byteSize: resource.byteSize,
        declaredMimeType: resource.declaredMimeType,
      });

      if (
        ticket.storage.bucket !== resource.storage.bucket ||
        ticket.storage.objectPath !== resource.storage.objectPath ||
        ticket.storage.version !== resource.storage.version
      ) {
        throw new ResourceUploadServiceError(
          "resource_upload_storage_location_mismatch",
          "Upload ticket storage location must match the persisted resource storage location",
        );
      }

      return {
        resource,
        ticket: {
          resourceId: resource.resourceId,
          storage: ticket.storage,
          uploadUrl: ticket.uploadUrl,
          expiresAt: ticket.expiresAt,
        },
      };
    },

    completeUpload: async (
      input: CompleteResourceUploadInput,
    ): Promise<CompleteResourceUploadResult> => {
      assertValidContentHash(input.contentHash);

      const resource = await dependencies.repository.markUploadCompleted({
        studentId: input.studentId,
        resourceId: input.resourceId,
        contentHash: input.contentHash.trim().toLowerCase(),
      });

      return {
        resource,
      };
    },
  };
}

function assertValidDeclareUploadInput(input: DeclareResourceUploadInput): void {
  if (input.originalFilename.trim().length === 0) {
    throw new ResourceUploadServiceError(
      "resource_upload_invalid_filename",
      "Resource upload requires an original filename",
    );
  }

  if (input.originalFilename.includes("/") || input.originalFilename.includes("\\")) {
    throw new ResourceUploadServiceError(
      "resource_upload_invalid_filename",
      "Resource upload filename must not contain path separators",
    );
  }

  if (input.declaredMimeType.trim().length === 0 || !input.declaredMimeType.includes("/")) {
    throw new ResourceUploadServiceError(
      "resource_upload_invalid_mime_type",
      "Resource upload requires a declared MIME type",
    );
  }

  if (!Number.isSafeInteger(input.byteSize) || input.byteSize <= 0) {
    throw new ResourceUploadServiceError(
      "resource_upload_invalid_byte_size",
      "Resource upload byte size must be a positive safe integer",
    );
  }
}

function assertValidContentHash(contentHash: string): void {
  const normalizedContentHash = contentHash.trim().toLowerCase();

  if (normalizedContentHash.length === 0) {
    throw new ResourceUploadServiceError(
      "resource_upload_invalid_content_hash",
      "Completed resource upload requires a content hash",
    );
  }

  if (!/^[a-z0-9:_-]+$/.test(normalizedContentHash)) {
    throw new ResourceUploadServiceError(
      "resource_upload_invalid_content_hash",
      "Completed resource upload content hash contains unsupported characters",
    );
  }
}