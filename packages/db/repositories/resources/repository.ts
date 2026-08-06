import type { ResourceId } from "@avora/core/identity";

import type { DatabaseClient } from "../../client/index.js";
import type {
  CreatePendingResourceUploadInput,
  GetResourceByIdInput,
  MarkResourceUploadCompletedInput,
  ResourcesRepository,
} from "./contracts.js";
import { ResourcesRepositoryError } from "./errors.js";
import {
  createResourceStorageObjectPath,
  mapResourceRow,
} from "./mapper.js";

const resourceSelectColumns =
  "resource_id,student_id,resource_kind,original_filename,declared_mime_type,byte_size,content_hash,lifecycle_state,storage_bucket,storage_object_path,storage_version,created_at,updated_at" as const;

export type CreateResourcesRepositoryInput = Readonly<{
  client: DatabaseClient;
}>;

export function createResourcesRepository(
  input: CreateResourcesRepositoryInput,
): ResourcesRepository {
  return {
    createPendingUpload: async (uploadInput: CreatePendingResourceUploadInput) => {
      const resourceId = globalThis.crypto.randomUUID() as ResourceId;

      const storageObjectPath = createResourceStorageObjectPath({
        studentId: uploadInput.studentId,
        resourceId,
        originalFilename: uploadInput.originalFilename,
      });

      const { data, error } = await input.client
        .from("resources")
        .insert({
          resource_id: resourceId,
          student_id: uploadInput.studentId,
          resource_kind: uploadInput.kind,
          original_filename: uploadInput.originalFilename,
          declared_mime_type: uploadInput.declaredMimeType,
          byte_size: uploadInput.byteSize,
          lifecycle_state: "pending_upload",
          storage_bucket: "quarantine",
          storage_object_path: storageObjectPath,
          storage_version: 1,
        })
        .select(resourceSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourcesRepositoryError(
          "resources_repository_create_failed",
          error.message,
        );
      }

      if (data === null) {
        throw new ResourcesRepositoryError(
          "resources_repository_invalid_insert_result",
          "Resource insert did not return a row",
        );
      }

      return mapResourceRow(data);
    },

    markUploadCompleted: async (uploadInput: MarkResourceUploadCompletedInput) => {
      const { data, error } = await input.client
        .from("resources")
        .update({
          content_hash: uploadInput.contentHash,
          lifecycle_state: "uploaded",
          updated_at: new Date().toISOString(),
        })
        .eq("student_id", uploadInput.studentId)
        .eq("resource_id", uploadInput.resourceId)
        .eq("lifecycle_state", "pending_upload")
        .select(resourceSelectColumns)
        .maybeSingle();

      if (error !== null) {
        throw new ResourcesRepositoryError(
          "resources_repository_complete_failed",
          error.message,
        );
      }

      if (data === null) {
        throw new ResourcesRepositoryError(
          "resources_repository_missing_completed_resource",
          "No pending resource upload matched the requested student and resource",
        );
      }

      return mapResourceRow(data);
    },

    getById: async (readInput: GetResourceByIdInput) => {
      const { data, error } = await input.client
        .from("resources")
        .select(resourceSelectColumns)
        .eq("student_id", readInput.studentId)
        .eq("resource_id", readInput.resourceId)
        .maybeSingle();

      if (error !== null) {
        throw new ResourcesRepositoryError(
          "resources_repository_read_failed",
          error.message,
        );
      }

      if (data === null) {
        return null;
      }

      return mapResourceRow(data);
    },
  };
}