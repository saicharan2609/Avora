import type { ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type { Database } from "../../generated/index.js";
import type {
  DbResourceRecord,
  DbResourceStorageBucket,
} from "./contracts.js";
import { ResourcesRepositoryError } from "./errors.js";

type ResourceRow = Database["public"]["Tables"]["resources"]["Row"];

export function mapResourceRow(row: ResourceRow): DbResourceRecord {
  assertStoragePathBelongsToStudent(row.student_id, row.storage_object_path);

  return {
    resourceId: row.resource_id as ResourceId,
    studentId: row.student_id as StudentId,
    kind: row.resource_kind,
    originalFilename: row.original_filename,
    declaredMimeType: row.declared_mime_type,
    byteSize: row.byte_size,
    contentHash: row.content_hash,
    lifecycleState: row.lifecycle_state,
    storage: {
      bucket: row.storage_bucket as DbResourceStorageBucket,
      objectPath: row.storage_object_path,
      version: row.storage_version,
    },
    createdAt: row.created_at as IsoDateTimeString,
    updatedAt: row.updated_at as IsoDateTimeString,
  };
}

export function createResourceStorageObjectPath(input: Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  originalFilename: string;
}>): string {
  const filename = input.originalFilename.trim();

  assertSafePathSegment(input.studentId, "studentId");
  assertSafePathSegment(input.resourceId, "resourceId");
  assertSafeFilename(filename);

  return `${input.studentId}/${input.resourceId}/${filename}`;
}

function assertStoragePathBelongsToStudent(studentId: string, objectPath: string): void {
  if (!objectPath.startsWith(`${studentId}/`)) {
    throw new ResourcesRepositoryError(
      "resources_repository_invalid_storage_path",
      "Resource storage object path must begin with student_id",
    );
  }
}

function assertSafePathSegment(value: string, label: string): void {
  if (value.length === 0 || value === "." || value === ".." || value.includes("/")) {
    throw new ResourcesRepositoryError(
      "resources_repository_invalid_storage_path",
      `${label} is not a safe resource storage path segment`,
    );
  }
}

function assertSafeFilename(filename: string): void {
  if (
    filename.length === 0 ||
    filename === "." ||
    filename === ".." ||
    filename.includes("/") ||
    filename.includes("\\")
  ) {
    throw new ResourcesRepositoryError(
      "resources_repository_invalid_storage_path",
      "Resource original filename is not safe for storage object path creation",
    );
  }
}