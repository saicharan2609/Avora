import type { JobId, ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "../../generated/database.types.js";

export type DbResourceIngestionJobStatus =
  Database["public"]["Enums"]["resource_ingestion_job_status"];

export type DbResourceIngestionJobPriority =
  Database["public"]["Enums"]["resource_ingestion_job_priority"];

export type DbResourceIngestionJobReason =
  Database["public"]["Enums"]["resource_ingestion_job_reason"];

export type DbResourceIngestionJobStorageBucket =
  | "quarantine"
  | "originals"
  | "derivatives"
  | "exports"
  | "shared";

export type DbResourceIngestionJobPayload = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  storage: Readonly<{
    bucket: DbResourceIngestionJobStorageBucket;
    objectPath: string;
    version: number;
  }>;
  declaredMimeType: string;
  byteSize: number;
  contentHash: string;
  requestedAt: IsoDateTimeString;
}>;

export type DbResourceIngestionJobRecord = Readonly<{
  jobId: JobId;
  studentId: StudentId;
  resourceId: ResourceId;
  jobName: "resources.ingestion.requested";
  reason: DbResourceIngestionJobReason;
  priority: DbResourceIngestionJobPriority;
  status: DbResourceIngestionJobStatus;
  attemptCount: number;
  payload: DbResourceIngestionJobPayload;
  lockedAt: IsoDateTimeString | null;
  lockedBy: string | null;
  heartbeatAt: IsoDateTimeString | null;
  availableAt: IsoDateTimeString;
  enqueuedAt: IsoDateTimeString;
  startedAt: IsoDateTimeString | null;
  completedAt: IsoDateTimeString | null;
  failedAt: IsoDateTimeString | null;
  lastError: string | null;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}>;

export type CreateResourceIngestionJobInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  jobName: "resources.ingestion.requested";
  reason: DbResourceIngestionJobReason;
  priority: DbResourceIngestionJobPriority;
  payload: DbResourceIngestionJobPayload;
}>;

export type GetResourceIngestionJobByIdInput = Readonly<{
  studentId: StudentId;
  jobId: JobId;
}>;

export type ResourceIngestionJobsRepository = Readonly<{
  enqueueResourceIngestionJob: (
    input: CreateResourceIngestionJobInput,
  ) => Promise<DbResourceIngestionJobRecord>;
  getResourceIngestionJobById: (
    input: GetResourceIngestionJobByIdInput,
  ) => Promise<DbResourceIngestionJobRecord | null>;
}>;

export type CreateResourceIngestionJobsRepositoryInput = Readonly<{
  client: SupabaseClient<Database>;
}>;

export type ResourceIngestionJobsRepositoryErrorCode =
  | "resource_ingestion_jobs_invalid_payload"
  | "resource_ingestion_jobs_insert_failed"
  | "resource_ingestion_jobs_read_failed";

export class ResourceIngestionJobsRepositoryError extends Error {
  public readonly code: ResourceIngestionJobsRepositoryErrorCode;

  public constructor(code: ResourceIngestionJobsRepositoryErrorCode, message: string) {
    super(message);
    this.name = "ResourceIngestionJobsRepositoryError";
    this.code = code;
  }
}

const resourceIngestionJobSelectColumns =
  "job_id,student_id,resource_id,job_name,reason,priority,status,attempt_count,payload,locked_at,locked_by,heartbeat_at,available_at,enqueued_at,started_at,completed_at,failed_at,last_error,created_at,updated_at" as const;

export function createResourceIngestionJobsRepository(
  input: CreateResourceIngestionJobsRepositoryInput,
): ResourceIngestionJobsRepository {
  return {
    enqueueResourceIngestionJob: async (
      job: CreateResourceIngestionJobInput,
    ): Promise<DbResourceIngestionJobRecord> => {
      assertValidPayload(job.payload);

      const { data, error } = await input.client
        .from("resource_ingestion_jobs")
        .insert({
          student_id: job.studentId,
          resource_id: job.resourceId,
          job_name: job.jobName,
          reason: job.reason,
          priority: job.priority,
          status: "queued",
          attempt_count: 0,
          payload: job.payload as unknown as Json,
        })
        .select(resourceIngestionJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceIngestionJobsRepositoryError(
          "resource_ingestion_jobs_insert_failed",
          error.message,
        );
      }

      return mapResourceIngestionJobRow(data);
    },

    getResourceIngestionJobById: async (
      lookup: GetResourceIngestionJobByIdInput,
    ): Promise<DbResourceIngestionJobRecord | null> => {
      const { data, error } = await input.client
        .from("resource_ingestion_jobs")
        .select(resourceIngestionJobSelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("job_id", lookup.jobId)
        .maybeSingle();

      if (error !== null) {
        throw new ResourceIngestionJobsRepositoryError(
          "resource_ingestion_jobs_read_failed",
          error.message,
        );
      }

      if (data === null) {
        return null;
      }

      return mapResourceIngestionJobRow(data);
    },
  };
}

function assertValidPayload(payload: DbResourceIngestionJobPayload): void {
  if (payload.storage.objectPath.length === 0) {
    throw new ResourceIngestionJobsRepositoryError(
      "resource_ingestion_jobs_invalid_payload",
      "Resource ingestion job payload requires a storage object path.",
    );
  }

  if (payload.storage.version <= 0 || !Number.isSafeInteger(payload.storage.version)) {
    throw new ResourceIngestionJobsRepositoryError(
      "resource_ingestion_jobs_invalid_payload",
      "Resource ingestion job payload requires a positive storage version.",
    );
  }

  if (payload.declaredMimeType.length === 0) {
    throw new ResourceIngestionJobsRepositoryError(
      "resource_ingestion_jobs_invalid_payload",
      "Resource ingestion job payload requires a declared MIME type.",
    );
  }

  if (!Number.isSafeInteger(payload.byteSize) || payload.byteSize <= 0) {
    throw new ResourceIngestionJobsRepositoryError(
      "resource_ingestion_jobs_invalid_payload",
      "Resource ingestion job payload requires a positive byte size.",
    );
  }

  if (payload.contentHash.length === 0) {
    throw new ResourceIngestionJobsRepositoryError(
      "resource_ingestion_jobs_invalid_payload",
      "Resource ingestion job payload requires a content hash.",
    );
  }

  if (payload.requestedAt.length === 0) {
    throw new ResourceIngestionJobsRepositoryError(
      "resource_ingestion_jobs_invalid_payload",
      "Resource ingestion job payload requires a requested-at timestamp.",
    );
  }
}

function mapResourceIngestionJobRow(
  row: Database["public"]["Tables"]["resource_ingestion_jobs"]["Row"],
): DbResourceIngestionJobRecord {
  return {
    jobId: row.job_id as JobId,
    studentId: row.student_id as StudentId,
    resourceId: row.resource_id as ResourceId,
    jobName: row.job_name as "resources.ingestion.requested",
    reason: row.reason,
    priority: row.priority,
    status: row.status,
    attemptCount: row.attempt_count,
    payload: mapPayload(row.payload),
    lockedAt: row.locked_at as IsoDateTimeString | null,
    lockedBy: row.locked_by,
    heartbeatAt: row.heartbeat_at as IsoDateTimeString | null,
    availableAt: row.available_at as IsoDateTimeString,
    enqueuedAt: row.enqueued_at as IsoDateTimeString,
    startedAt: row.started_at as IsoDateTimeString | null,
    completedAt: row.completed_at as IsoDateTimeString | null,
    failedAt: row.failed_at as IsoDateTimeString | null,
    lastError: row.last_error,
    createdAt: row.created_at as IsoDateTimeString,
    updatedAt: row.updated_at as IsoDateTimeString,
  };
}

function mapPayload(payload: Json): DbResourceIngestionJobPayload {
  if (!isJsonObject(payload)) {
    throwInvalidPayloadShape();
  }

  const studentId = payload["studentId"];
  const resourceId = payload["resourceId"];
  const storage = payload["storage"];
  const declaredMimeType = payload["declaredMimeType"];
  const byteSize = payload["byteSize"];
  const contentHash = payload["contentHash"];
  const requestedAt = payload["requestedAt"];

  if (
    typeof studentId !== "string"
    || typeof resourceId !== "string"
    || !isJsonObject(storage)
    || typeof declaredMimeType !== "string"
    || typeof byteSize !== "number"
    || typeof contentHash !== "string"
    || typeof requestedAt !== "string"
  ) {
    throwInvalidPayloadShape();
  }

  const storageBucket = storage["bucket"];
  const storageObjectPath = storage["objectPath"];
  const storageVersion = storage["version"];

  if (
    !isResourceIngestionJobStorageBucket(storageBucket)
    || typeof storageObjectPath !== "string"
    || typeof storageVersion !== "number"
  ) {
    throwInvalidPayloadShape();
  }

  return {
    studentId: studentId as StudentId,
    resourceId: resourceId as ResourceId,
    storage: {
      bucket: storageBucket,
      objectPath: storageObjectPath,
      version: storageVersion,
    },
    declaredMimeType,
    byteSize,
    contentHash,
    requestedAt: requestedAt as IsoDateTimeString,
  };
}

function isJsonObject(
  value: Json | undefined,
): value is { [key: string]: Json | undefined } {
  return (
    value !== undefined &&
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isResourceIngestionJobStorageBucket(
  value: Json | undefined,
): value is DbResourceIngestionJobStorageBucket {
  return (
    value === "quarantine"
    || value === "originals"
    || value === "derivatives"
    || value === "exports"
    || value === "shared"
  );
}

function throwInvalidPayloadShape(): never {
  throw new ResourceIngestionJobsRepositoryError(
    "resource_ingestion_jobs_invalid_payload",
    "Resource ingestion job payload has an unsupported shape.",
  );
}