import type { ResourceId, StudentId } from "@avora/core/identity";

import type { SupabaseResourceStorageLocation } from "./contracts.js";
import { SupabaseStorageAdapterError } from "./errors.js";

const unsafePathSegments = new Set(["", ".", ".."]);

export function createStudentResourceObjectPath(input: Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  filename: string;
}>): string {
  const filename = input.filename.trim();

  assertSafePathSegment(input.studentId, "studentId");
  assertSafePathSegment(input.resourceId, "resourceId");
  assertSafeFilename(filename);

  return `${input.studentId}/${input.resourceId}/${filename}`;
}

export function assertStoragePathBelongsToStudent(input: Readonly<{
  studentId: StudentId;
  storage: SupabaseResourceStorageLocation;
}>): void {
  const expectedPrefix = `${input.studentId}/`;

  if (!input.storage.objectPath.startsWith(expectedPrefix)) {
    throw new SupabaseStorageAdapterError(
      "storage_invalid_student_path",
      "Storage object path must begin with the owning student id",
    );
  }

  assertSafeObjectPath(input.storage.objectPath);
}

export function assertSafeObjectPath(objectPath: string): void {
  const segments = objectPath.split("/");

  if (segments.length < 3) {
    throw new SupabaseStorageAdapterError(
      "storage_invalid_object_path",
      "Storage object path must contain student, resource, and object segments",
    );
  }

  for (const segment of segments) {
    if (unsafePathSegments.has(segment)) {
      throw new SupabaseStorageAdapterError(
        "storage_invalid_object_path",
        "Storage object path contains an unsafe segment",
      );
    }
  }
}

function assertSafePathSegment(value: string, label: string): void {
  if (unsafePathSegments.has(value) || value.includes("/")) {
    throw new SupabaseStorageAdapterError(
      "storage_invalid_object_path",
      `${label} is not a safe storage path segment`,
    );
  }
}

function assertSafeFilename(filename: string): void {
  if (unsafePathSegments.has(filename) || filename.includes("/")) {
    throw new SupabaseStorageAdapterError(
      "storage_invalid_object_path",
      "Filename is not a safe storage path segment",
    );
  }
}