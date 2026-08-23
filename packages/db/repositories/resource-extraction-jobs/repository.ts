import type { JobId, ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "../../generated/database.types.js";
import type {
  ClaimedDbResourceExtractionJobRecord,
  ClaimQueuedResourceExtractionJobsInput,
  CompleteResourceExtractionJobInput,
  FailResourceExtractionJobInput,
  RecordResourceExtractionJobHeartbeatInput,
  ReleaseResourceExtractionJobInput,
} from "./claim.js";

export type DbResourceExtractionJobStatus =
  Database["public"]["Enums"]["resource_extraction_job_status"];

export type DbResourceExtractionJobPriority =
  Database["public"]["Enums"]["resource_extraction_job_priority"];

export type DbResourceExtractionJobReason =
  Database["public"]["Enums"]["resource_extraction_job_reason"];

export type DbResourceExtractionJobStorageBucket = "resources";

export type DbResourceExtractionJobPayload = Readonly<{
  extractionDocumentId: string;
  studentId: StudentId;
  resourceId: ResourceId;
  storage: Readonly<{
    bucket: DbResourceExtractionJobStorageBucket;
    objectPath: string;
  }>;
  declaredMimeType: string;
  byteSize: number;
  contentHash: string;
  extractionStrategyVersion: string;
  chunkingStrategyVersion: string;
  requestedAt: IsoDateTimeString;
}>;

export type DbResourceExtractionJobRecord = Readonly<{
  jobId: JobId;
  studentId: StudentId;
  resourceId: ResourceId;
  jobName: "resource.extraction.extract";
  reason: DbResourceExtractionJobReason;
  priority: DbResourceExtractionJobPriority;
  status: DbResourceExtractionJobStatus;
  attemptCount: number;
  payload: DbResourceExtractionJobPayload;
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

export type CreateResourceExtractionJobInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  jobName: "resource.extraction.extract";
  reason: DbResourceExtractionJobReason;
  priority: DbResourceExtractionJobPriority;
  payload: DbResourceExtractionJobPayload;
}>;

export type GetResourceExtractionJobByIdInput = Readonly<{
  studentId: StudentId;
  jobId: JobId;
}>;

export type ResourceExtractionJobsRepository = Readonly<{
  enqueueResourceExtractionJob: (
    input: CreateResourceExtractionJobInput,
  ) => Promise<DbResourceExtractionJobRecord>;
  getResourceExtractionJobById: (
    input: GetResourceExtractionJobByIdInput,
  ) => Promise<DbResourceExtractionJobRecord | null>;
  claimQueuedResourceExtractionJobs: (
    input: ClaimQueuedResourceExtractionJobsInput,
  ) => Promise<readonly ClaimedDbResourceExtractionJobRecord[]>;
  recordResourceExtractionJobHeartbeat: (
    input: RecordResourceExtractionJobHeartbeatInput,
  ) => Promise<ClaimedDbResourceExtractionJobRecord>;
  releaseResourceExtractionJob: (
    input: ReleaseResourceExtractionJobInput,
  ) => Promise<DbResourceExtractionJobRecord>;
  completeResourceExtractionJob: (
    input: CompleteResourceExtractionJobInput,
  ) => Promise<DbResourceExtractionJobRecord>;
  failResourceExtractionJob: (
    input: FailResourceExtractionJobInput,
  ) => Promise<DbResourceExtractionJobRecord>;
}>;

export type CreateResourceExtractionJobsRepositoryInput = Readonly<{
  client: SupabaseClient<Database>;
}>;

export type ResourceExtractionJobsRepositoryErrorCode =
  | "resource_extraction_jobs_invalid_payload"
  | "resource_extraction_jobs_invalid_claim"
  | "resource_extraction_jobs_insert_failed"
  | "resource_extraction_jobs_read_failed"
  | "resource_extraction_jobs_claim_failed"
  | "resource_extraction_jobs_completion_failed"
  | "resource_extraction_jobs_heartbeat_failed"
  | "resource_extraction_jobs_release_failed"
  | "resource_extraction_jobs_failure_record_failed";

export class ResourceExtractionJobsRepositoryError extends Error {
  public readonly code: ResourceExtractionJobsRepositoryErrorCode;

  public constructor(code: ResourceExtractionJobsRepositoryErrorCode, message: string) {
    super(message);
    this.name = "ResourceExtractionJobsRepositoryError";
    this.code = code;
  }
}

const resourceExtractionJobSelectColumns =
  "job_id,student_id,resource_id,job_name,reason,priority,status,attempt_count,payload,locked_at,locked_by,heartbeat_at,available_at,enqueued_at,started_at,completed_at,failed_at,last_error,created_at,updated_at" as const;

export function createResourceExtractionJobsRepository(
  input: CreateResourceExtractionJobsRepositoryInput,
): ResourceExtractionJobsRepository {
  return {
    enqueueResourceExtractionJob: async (
      job: CreateResourceExtractionJobInput,
    ): Promise<DbResourceExtractionJobRecord> => {
      assertValidPayload(job.payload);

      const { data, error } = await input.client
        .from("resource_extraction_jobs")
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
        .select(resourceExtractionJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceExtractionJobsRepositoryError(
          "resource_extraction_jobs_insert_failed",
          error.message,
        );
      }

      return mapResourceExtractionJobRow(data);
    },

    getResourceExtractionJobById: async (
      lookup: GetResourceExtractionJobByIdInput,
    ): Promise<DbResourceExtractionJobRecord | null> => {
      const { data, error } = await input.client
        .from("resource_extraction_jobs")
        .select(resourceExtractionJobSelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("job_id", lookup.jobId)
        .maybeSingle();

      if (error !== null) {
        throw new ResourceExtractionJobsRepositoryError(
          "resource_extraction_jobs_read_failed",
          error.message,
        );
      }

      if (data === null) {
        return null;
      }

      return mapResourceExtractionJobRow(data);
    },

    claimQueuedResourceExtractionJobs: async (
      claim: ClaimQueuedResourceExtractionJobsInput,
    ): Promise<readonly ClaimedDbResourceExtractionJobRecord[]> => {
      assertValidClaimInput(claim);

      const staleClaimCutoff = new Date(
        Date.now() - claim.staleClaimThresholdSeconds * 1000,
      ).toISOString();

      const { data: candidates, error: readError } = await input.client
        .from("resource_extraction_jobs")
        .select(resourceExtractionJobSelectColumns)
        .or(
          [
            `and(status.eq.queued,available_at.lte.${new Date().toISOString()})`,
            `and(status.eq.claimed,heartbeat_at.lt.${staleClaimCutoff})`,
          ].join(","),
        )
        .order("priority", { ascending: true })
        .order("available_at", { ascending: true })
        .limit(claim.limit);

      if (readError !== null) {
        throw new ResourceExtractionJobsRepositoryError(
          "resource_extraction_jobs_claim_failed",
          readError.message,
        );
      }

      const claimedJobs: ClaimedDbResourceExtractionJobRecord[] = [];

      for (const candidate of candidates) {
        const { data: claimed, error: updateError } = await input.client
          .from("resource_extraction_jobs")
          .update({
            status: "claimed",
            locked_at: new Date().toISOString(),
            locked_by: claim.workerId,
            heartbeat_at: new Date().toISOString(),
            attempt_count: candidate.attempt_count + 1,
            started_at: candidate.started_at ?? new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("job_id", candidate.job_id)
          .in("status", ["queued", "claimed"])
          .select(resourceExtractionJobSelectColumns)
          .maybeSingle();

        if (updateError !== null) {
          throw new ResourceExtractionJobsRepositoryError(
            "resource_extraction_jobs_claim_failed",
            updateError.message,
          );
        }

        if (claimed !== null) {
          claimedJobs.push(mapClaimedResourceExtractionJobRow(claimed));
        }
      }

      return claimedJobs;
    },

    recordResourceExtractionJobHeartbeat: async (
      heartbeat: RecordResourceExtractionJobHeartbeatInput,
    ): Promise<ClaimedDbResourceExtractionJobRecord> => {
      const { data, error } = await input.client
        .from("resource_extraction_jobs")
        .update({
          heartbeat_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("job_id", heartbeat.jobId)
        .eq("locked_by", heartbeat.workerId)
        .eq("status", "claimed")
        .select(resourceExtractionJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceExtractionJobsRepositoryError(
          "resource_extraction_jobs_heartbeat_failed",
          error.message,
        );
      }

      return mapClaimedResourceExtractionJobRow(data);
    },

    releaseResourceExtractionJob: async (
      release: ReleaseResourceExtractionJobInput,
    ): Promise<DbResourceExtractionJobRecord> => {
      const { data, error } = await input.client
        .from("resource_extraction_jobs")
        .update({
          status: "queued",
          locked_at: null,
          locked_by: null,
          heartbeat_at: null,
          available_at: release.availableAt,
          updated_at: new Date().toISOString(),
        })
        .eq("job_id", release.jobId)
        .eq("locked_by", release.workerId)
        .eq("status", "claimed")
        .select(resourceExtractionJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceExtractionJobsRepositoryError(
          "resource_extraction_jobs_release_failed",
          error.message,
        );
      }

      return mapResourceExtractionJobRow(data);
    },

    failResourceExtractionJob: async (
      failure: FailResourceExtractionJobInput,
    ): Promise<DbResourceExtractionJobRecord> => {
      const { data, error } = await input.client
        .from("resource_extraction_jobs")
        .update({
          status: "failed",
          locked_at: null,
          locked_by: null,
          heartbeat_at: null,
          failed_at: new Date().toISOString(),
          last_error: failure.errorMessage,
          updated_at: new Date().toISOString(),
        })
        .eq("job_id", failure.jobId)
        .eq("locked_by", failure.workerId)
        .eq("status", "claimed")
        .select(resourceExtractionJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceExtractionJobsRepositoryError(
          "resource_extraction_jobs_failure_record_failed",
          error.message,
        );
      }

      return mapResourceExtractionJobRow(data);
    },

    completeResourceExtractionJob: async (
      completion: CompleteResourceExtractionJobInput,
    ): Promise<DbResourceExtractionJobRecord> => {
      const { data, error } = await input.client
        .from("resource_extraction_jobs")
        .update({
          status: "succeeded",
          locked_at: null,
          locked_by: null,
          heartbeat_at: null,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("job_id", completion.jobId)
        .eq("locked_by", completion.workerId)
        .eq("status", "claimed")
        .select(resourceExtractionJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceExtractionJobsRepositoryError(
          "resource_extraction_jobs_completion_failed",
          error.message,
        );
      }

      return mapResourceExtractionJobRow(data);
    },
  };
}

function assertValidClaimInput(input: ClaimQueuedResourceExtractionJobsInput): void {
  if (input.workerId.length === 0) {
    throw new ResourceExtractionJobsRepositoryError(
      "resource_extraction_jobs_invalid_claim",
      "Resource extraction job claim requires a worker identifier.",
    );
  }

  if (!Number.isSafeInteger(input.limit) || input.limit <= 0) {
    throw new ResourceExtractionJobsRepositoryError(
      "resource_extraction_jobs_invalid_claim",
      "Resource extraction job claim requires a positive limit.",
    );
  }

  if (
    !Number.isSafeInteger(input.staleClaimThresholdSeconds)
    || input.staleClaimThresholdSeconds <= 0
  ) {
    throw new ResourceExtractionJobsRepositoryError(
      "resource_extraction_jobs_invalid_claim",
      "Resource extraction job claim requires a positive stale-claim threshold.",
    );
  }
}

function assertValidPayload(payload: DbResourceExtractionJobPayload): void {
  if (payload.extractionDocumentId.length === 0) {
    throw new ResourceExtractionJobsRepositoryError(
      "resource_extraction_jobs_invalid_payload",
      "Resource extraction job payload requires an extraction document id.",
    );
  }

  if (payload.storage.objectPath.length === 0) {
    throw new ResourceExtractionJobsRepositoryError(
      "resource_extraction_jobs_invalid_payload",
      "Resource extraction job payload requires a storage object path.",
    );
  }

  if (payload.declaredMimeType.length === 0) {
    throw new ResourceExtractionJobsRepositoryError(
      "resource_extraction_jobs_invalid_payload",
      "Resource extraction job payload requires a declared MIME type.",
    );
  }

  if (!Number.isSafeInteger(payload.byteSize) || payload.byteSize < 0) {
    throw new ResourceExtractionJobsRepositoryError(
      "resource_extraction_jobs_invalid_payload",
      "Resource extraction job payload requires a non-negative byte size.",
    );
  }

  if (payload.contentHash.length === 0) {
    throw new ResourceExtractionJobsRepositoryError(
      "resource_extraction_jobs_invalid_payload",
      "Resource extraction job payload requires a content hash.",
    );
  }

  if (payload.extractionStrategyVersion.length === 0) {
    throw new ResourceExtractionJobsRepositoryError(
      "resource_extraction_jobs_invalid_payload",
      "Resource extraction job payload requires an extraction strategy version.",
    );
  }

  if (payload.chunkingStrategyVersion.length === 0) {
    throw new ResourceExtractionJobsRepositoryError(
      "resource_extraction_jobs_invalid_payload",
      "Resource extraction job payload requires a chunking strategy version.",
    );
  }

  if (payload.requestedAt.length === 0) {
    throw new ResourceExtractionJobsRepositoryError(
      "resource_extraction_jobs_invalid_payload",
      "Resource extraction job payload requires a requested-at timestamp.",
    );
  }
}

function mapClaimedResourceExtractionJobRow(
  row: Database["public"]["Tables"]["resource_extraction_jobs"]["Row"],
): ClaimedDbResourceExtractionJobRecord {
  const mapped = mapResourceExtractionJobRow(row);

  if (mapped.status !== "claimed" || mapped.lockedAt === null || mapped.lockedBy === null) {
    throw new ResourceExtractionJobsRepositoryError(
      "resource_extraction_jobs_claim_failed",
      "Resource extraction job row is not in a claimed state.",
    );
  }

  return {
    ...mapped,
    status: "claimed",
    lockedAt: mapped.lockedAt,
    lockedBy: mapped.lockedBy,
  };
}

function mapResourceExtractionJobRow(
  row: Database["public"]["Tables"]["resource_extraction_jobs"]["Row"],
): DbResourceExtractionJobRecord {
  return {
    jobId: row.job_id as JobId,
    studentId: row.student_id as StudentId,
    resourceId: row.resource_id as ResourceId,
    jobName: row.job_name as "resource.extraction.extract",
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

function mapPayload(payload: Json): DbResourceExtractionJobPayload {
  if (!isJsonObject(payload)) {
    throwInvalidPayloadShape();
  }

  assertValidPayloadFieldShape(payload);

  const storage = payload["storage"];

  if (!isJsonObject(storage)) {
    throwInvalidPayloadShape();
  }

  const storageBucket = storage["bucket"];
  const storageObjectPath = storage["objectPath"];

  if (storageBucket !== "resources" || typeof storageObjectPath !== "string") {
    throwInvalidPayloadShape();
  }

  return {
    extractionDocumentId: payload["extractionDocumentId"] as string,
    studentId: payload["studentId"] as StudentId,
    resourceId: payload["resourceId"] as ResourceId,
    storage: {
      bucket: storageBucket,
      objectPath: storageObjectPath,
    },
    declaredMimeType: payload["declaredMimeType"] as string,
    byteSize: payload["byteSize"] as number,
    contentHash: payload["contentHash"] as string,
    extractionStrategyVersion: payload["extractionStrategyVersion"] as string,
    chunkingStrategyVersion: payload["chunkingStrategyVersion"] as string,
    requestedAt: payload["requestedAt"] as IsoDateTimeString,
  };
}

function assertValidPayloadFieldShape(payload: Record<string, Json>): void {
  if (
    typeof payload["extractionDocumentId"] !== "string"
    || typeof payload["studentId"] !== "string"
    || typeof payload["resourceId"] !== "string"
    || typeof payload["declaredMimeType"] !== "string"
    || typeof payload["byteSize"] !== "number"
    || typeof payload["contentHash"] !== "string"
  ) {
    throwInvalidPayloadShape();
  }

  if (
    typeof payload["extractionStrategyVersion"] !== "string"
    || typeof payload["chunkingStrategyVersion"] !== "string"
    || typeof payload["requestedAt"] !== "string"
  ) {
    throwInvalidPayloadShape();
  }
}

function isJsonObject(value: unknown): value is Record<string, Json> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function throwInvalidPayloadShape(): never {
  throw new ResourceExtractionJobsRepositoryError(
    "resource_extraction_jobs_invalid_payload",
    "Resource extraction job payload has an unsupported shape.",
  );
}
