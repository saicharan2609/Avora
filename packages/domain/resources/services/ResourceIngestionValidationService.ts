import type { ResourceId, StudentId } from "@avora/core/identity";
import type { ResourceIngestionJobPayload } from "../jobs/index.js";
import type { ResourceStorageLocation } from "../contracts/index.js";
import type {
  ResourceIngestionValidationIssue,
  ResourceIngestionValidationResult,
} from "../contracts/index.js";
import type { ResourceObjectInspectionPort } from "../ports/index.js";

export type ResourceForIngestionValidation = Readonly<{
  resourceId: ResourceId;
  studentId: StudentId;
  lifecycleState: "pending_upload" | "uploaded" | "processing" | "ready" | "rejected" | "failed";
  storage: ResourceStorageLocation;
  declaredMimeType: string;
  byteSize: number;
  contentHash: string | null;
}>;

export type GetResourceForIngestionInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
}>;

export type MarkResourceProcessingInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
}>;

export type MarkResourceRejectedInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  reason: string;
}>;

export type ResourceIngestionValidationRepositoryPort = Readonly<{
  getResourceForIngestion: (
    input: GetResourceForIngestionInput,
  ) => Promise<ResourceForIngestionValidation | null>;
  markResourceProcessing: (
    input: MarkResourceProcessingInput,
  ) => Promise<ResourceForIngestionValidation>;
  markResourceRejected: (
    input: MarkResourceRejectedInput,
  ) => Promise<ResourceForIngestionValidation>;
}>;

export type ValidateResourceIngestionInput = Readonly<{
  payload: ResourceIngestionJobPayload;
}>;

export type ResourceIngestionValidationService = Readonly<{
  validateResourceIngestion: (
    input: ValidateResourceIngestionInput,
  ) => Promise<ResourceIngestionValidationResult>;
}>;

export type ResourceIngestionValidationServiceDependencies = Readonly<{
  repository: ResourceIngestionValidationRepositoryPort;
  objectInspection: ResourceObjectInspectionPort;
}>;

export function createResourceIngestionValidationService(
  dependencies: ResourceIngestionValidationServiceDependencies,
): ResourceIngestionValidationService {
  return {
    validateResourceIngestion: async (
      input: ValidateResourceIngestionInput,
    ): Promise<ResourceIngestionValidationResult> => {
      const resource = await dependencies.repository.getResourceForIngestion({
        studentId: input.payload.studentId,
        resourceId: input.payload.resourceId,
      });

      if (resource === null) {
        return reject({
          code: "resource_not_found",
          message: "Resource ingestion validation could not find the requested resource.",
        });
      }

      const consistencyIssue = validateResourceConsistency({
        resource,
        payload: input.payload,
      });

      if (consistencyIssue !== null) {
        await dependencies.repository.markResourceRejected({
          studentId: input.payload.studentId,
          resourceId: input.payload.resourceId,
          reason: consistencyIssue.message,
        });

        return reject(consistencyIssue);
      }

      const inspectedObject = await dependencies.objectInspection.inspectResourceObject({
        storage: input.payload.storage,
      });

      if (!inspectedObject.exists) {
        const issue: ResourceIngestionValidationIssue = {
          code: "storage_object_not_found",
          message: "Resource ingestion validation could not find the uploaded storage object.",
        };

        await dependencies.repository.markResourceRejected({
          studentId: input.payload.studentId,
          resourceId: input.payload.resourceId,
          reason: issue.message,
        });

        return reject(issue);
      }

      if (inspectedObject.byteSize !== input.payload.byteSize) {
        const issue: ResourceIngestionValidationIssue = {
          code: "resource_byte_size_mismatch",
          message: "Resource ingestion validation found a byte-size mismatch.",
        };

        await dependencies.repository.markResourceRejected({
          studentId: input.payload.studentId,
          resourceId: input.payload.resourceId,
          reason: issue.message,
        });

        return reject(issue);
      }

      if (normalizeMimeType(inspectedObject.contentType) !== normalizeMimeType(input.payload.declaredMimeType)) {
        const issue: ResourceIngestionValidationIssue = {
          code: "resource_mime_type_mismatch",
          message: "Resource ingestion validation found a MIME type mismatch.",
        };

        await dependencies.repository.markResourceRejected({
          studentId: input.payload.studentId,
          resourceId: input.payload.resourceId,
          reason: issue.message,
        });

        return reject(issue);
      }

      await dependencies.repository.markResourceProcessing({
        studentId: input.payload.studentId,
        resourceId: input.payload.resourceId,
      });

      return {
        outcome: "valid",
      };
    },
  };
}

function validateResourceConsistency(input: Readonly<{
  resource: ResourceForIngestionValidation;
  payload: ResourceIngestionJobPayload;
}>): ResourceIngestionValidationIssue | null {
  if (input.resource.lifecycleState !== "uploaded") {
    return {
      code: "resource_not_uploaded",
      message: "Resource ingestion validation requires an uploaded resource.",
    };
  }

  if (!storageLocationsMatch(input.resource.storage, input.payload.storage)) {
    return {
      code: "resource_storage_mismatch",
      message: "Resource ingestion validation found a storage location mismatch.",
    };
  }

  if (input.resource.byteSize !== input.payload.byteSize) {
    return {
      code: "resource_byte_size_mismatch",
      message: "Resource ingestion validation found a resource byte-size mismatch.",
    };
  }

  if (normalizeMimeType(input.resource.declaredMimeType) !== normalizeMimeType(input.payload.declaredMimeType)) {
    return {
      code: "resource_mime_type_mismatch",
      message: "Resource ingestion validation found a declared MIME type mismatch.",
    };
  }

  if (
    input.resource.contentHash !== null
    && normalizeHash(input.resource.contentHash) !== normalizeHash(input.payload.contentHash)
  ) {
    return {
      code: "resource_content_hash_mismatch",
      message: "Resource ingestion validation found a content hash mismatch.",
    };
  }

  return null;
}

function storageLocationsMatch(
  left: ResourceStorageLocation,
  right: ResourceStorageLocation,
): boolean {
  return (
    left.bucket === right.bucket
    && left.objectPath === right.objectPath
    && left.version === right.version
  );
}

function normalizeMimeType(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeHash(value: string): string {
  return value.trim().toLowerCase();
}

function reject(issue: ResourceIngestionValidationIssue): ResourceIngestionValidationResult {
  return {
    outcome: "rejected",
    issue,
  };
}