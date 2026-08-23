import type { JobId, ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "../../generated/database.types.js";
import type {
  ClaimedDbResourceIndexingJobRecord,
  ClaimQueuedResourceIndexingJobsInput,
  CompleteResourceIndexingJobInput,
  FailResourceIndexingJobInput,
  RecordResourceIndexingJobHeartbeatInput,
  ReleaseResourceIndexingJobInput,
} from "./claim.js";

export type DbResourceIndexingJobStatus =
  Database["public"]["Enums"]["resource_indexing_job_status"];

export type DbResourceIndexingJobPriority =
  Database["public"]["Enums"]["resource_indexing_job_priority"];

export type DbResourceIndexingJobReason =
  Database["public"]["Enums"]["resource_indexing_job_reason"];

export type DbResourceIndexingJobPayload = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  embeddingStrategyVersion: string;
  chunkingStrategyVersion: string | null;
  sourceContentHash: string | null;
  requestedAt: IsoDateTimeString;
}>;

export type DbResourceIndexingJobRecord = Readonly<{
  jobId: JobId;
  studentId: StudentId;
  resourceId: ResourceId;
  jobName: "retrieval.index.resource";
  reason: DbResourceIndexingJobReason;
  priority: DbResourceIndexingJobPriority;
  status: DbResourceIndexingJobStatus;
  attemptCount: number;
  payload: DbResourceIndexingJobPayload;
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

export type CreateResourceIndexingJobInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  jobName: "retrieval.index.resource";
  reason: DbResourceIndexingJobReason;
  priority: DbResourceIndexingJobPriority;
  payload: DbResourceIndexingJobPayload;
}>;

export type GetResourceIndexingJobByIdInput = Readonly<{
  studentId: StudentId;
  jobId: JobId;
}>;

export type ResourceIndexingJobsRepository = Readonly<{
  enqueueResourceIndexingJob: (
    input: CreateResourceIndexingJobInput,
  ) => Promise<DbResourceIndexingJobRecord>;
  getResourceIndexingJobById: (
    input: GetResourceIndexingJobByIdInput,
  ) => Promise<DbResourceIndexingJobRecord | null>;
  claimQueuedResourceIndexingJobs: (
    input: ClaimQueuedResourceIndexingJobsInput,
  ) => Promise<readonly ClaimedDbResourceIndexingJobRecord[]>;
  recordResourceIndexingJobHeartbeat: (
    input: RecordResourceIndexingJobHeartbeatInput,
  ) => Promise<ClaimedDbResourceIndexingJobRecord>;
  releaseResourceIndexingJob: (
    input: ReleaseResourceIndexingJobInput,
  ) => Promise<DbResourceIndexingJobRecord>;
  completeResourceIndexingJob: (
    input: CompleteResourceIndexingJobInput,
  ) => Promise<DbResourceIndexingJobRecord>;
  failResourceIndexingJob: (
    input: FailResourceIndexingJobInput,
  ) => Promise<DbResourceIndexingJobRecord>;
}>;

export type CreateResourceIndexingJobsRepositoryInput = Readonly<{
  client: SupabaseClient<Database>;
}>;

export type ResourceIndexingJobsRepositoryErrorCode =
  | "resource_indexing_jobs_invalid_payload"
  | "resource_indexing_jobs_invalid_claim"
  | "resource_indexing_jobs_insert_failed"
  | "resource_indexing_jobs_read_failed"
  | "resource_indexing_jobs_claim_failed"
  | "resource_indexing_jobs_completion_failed"
  | "resource_indexing_jobs_heartbeat_failed"
  | "resource_indexing_jobs_release_failed"
  | "resource_indexing_jobs_failure_record_failed";

export class ResourceIndexingJobsRepositoryError extends Error {
  public readonly code: ResourceIndexingJobsRepositoryErrorCode;

  public constructor(code: ResourceIndexingJobsRepositoryErrorCode, message: string) {
    super(message);
    this.name = "ResourceIndexingJobsRepositoryError";
    this.code = code;
  }
}

const resourceIndexingJobSelectColumns =
  "job_id,student_id,resource_id,job_name,reason,priority,status,attempt_count,payload,locked_at,locked_by,heartbeat_at,available_at,enqueued_at,started_at,completed_at,failed_at,last_error,created_at,updated_at" as const;

export function createResourceIndexingJobsRepository(
  input: CreateResourceIndexingJobsRepositoryInput,
): ResourceIndexingJobsRepository {
  return {
    enqueueResourceIndexingJob: async (
      job: CreateResourceIndexingJobInput,
    ): Promise<DbResourceIndexingJobRecord> => {
      assertValidPayload(job.payload);

      const { data, error } = await input.client
        .from("resource_indexing_jobs")
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
        .select(resourceIndexingJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceIndexingJobsRepositoryError(
          "resource_indexing_jobs_insert_failed",
          error.message,
        );
      }

      return mapResourceIndexingJobRow(data);
    },

    getResourceIndexingJobById: async (
      lookup: GetResourceIndexingJobByIdInput,
    ): Promise<DbResourceIndexingJobRecord | null> => {
      const { data, error } = await input.client
        .from("resource_indexing_jobs")
        .select(resourceIndexingJobSelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("job_id", lookup.jobId)
        .maybeSingle();

      if (error !== null) {
        throw new ResourceIndexingJobsRepositoryError(
          "resource_indexing_jobs_read_failed",
          error.message,
        );
      }

      if (data === null) {
        return null;
      }

      return mapResourceIndexingJobRow(data);
    },

    claimQueuedResourceIndexingJobs: async (
      claim: ClaimQueuedResourceIndexingJobsInput,
    ): Promise<readonly ClaimedDbResourceIndexingJobRecord[]> => {
      assertValidClaimInput(claim);

      const staleClaimCutoff = new Date(
        Date.now() - claim.staleClaimThresholdSeconds * 1000,
      ).toISOString();

      const { data: candidates, error: readError } = await input.client
        .from("resource_indexing_jobs")
        .select(resourceIndexingJobSelectColumns)
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
        throw new ResourceIndexingJobsRepositoryError(
          "resource_indexing_jobs_claim_failed",
          readError.message,
        );
      }

      const claimedJobs: ClaimedDbResourceIndexingJobRecord[] = [];

      for (const candidate of candidates) {
        const { data: claimed, error: updateError } = await input.client
          .from("resource_indexing_jobs")
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
          .select(resourceIndexingJobSelectColumns)
          .maybeSingle();

        if (updateError !== null) {
          throw new ResourceIndexingJobsRepositoryError(
            "resource_indexing_jobs_claim_failed",
            updateError.message,
          );
        }

        if (claimed !== null) {
          claimedJobs.push(mapClaimedResourceIndexingJobRow(claimed));
        }
      }

      return claimedJobs;
    },

    recordResourceIndexingJobHeartbeat: async (
      heartbeat: RecordResourceIndexingJobHeartbeatInput,
    ): Promise<ClaimedDbResourceIndexingJobRecord> => {
      const { data, error } = await input.client
        .from("resource_indexing_jobs")
        .update({
          heartbeat_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("job_id", heartbeat.jobId)
        .eq("locked_by", heartbeat.workerId)
        .eq("status", "claimed")
        .select(resourceIndexingJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceIndexingJobsRepositoryError(
          "resource_indexing_jobs_heartbeat_failed",
          error.message,
        );
      }

      return mapClaimedResourceIndexingJobRow(data);
    },

    releaseResourceIndexingJob: async (
      release: ReleaseResourceIndexingJobInput,
    ): Promise<DbResourceIndexingJobRecord> => {
      const { data, error } = await input.client
        .from("resource_indexing_jobs")
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
        .select(resourceIndexingJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceIndexingJobsRepositoryError(
          "resource_indexing_jobs_release_failed",
          error.message,
        );
      }

      return mapResourceIndexingJobRow(data);
    },

    failResourceIndexingJob: async (
      failure: FailResourceIndexingJobInput,
    ): Promise<DbResourceIndexingJobRecord> => {
      const { data, error } = await input.client
        .from("resource_indexing_jobs")
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
        .select(resourceIndexingJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceIndexingJobsRepositoryError(
          "resource_indexing_jobs_failure_record_failed",
          error.message,
        );
      }

      return mapResourceIndexingJobRow(data);
    },

    completeResourceIndexingJob: async (
      completion: CompleteResourceIndexingJobInput,
    ): Promise<DbResourceIndexingJobRecord> => {
      const { data, error } = await input.client
        .from("resource_indexing_jobs")
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
        .select(resourceIndexingJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceIndexingJobsRepositoryError(
          "resource_indexing_jobs_completion_failed",
          error.message,
        );
      }

      return mapResourceIndexingJobRow(data);
    },
  };
}

function assertValidClaimInput(input: ClaimQueuedResourceIndexingJobsInput): void {
  if (input.workerId.length === 0) {
    throw new ResourceIndexingJobsRepositoryError(
      "resource_indexing_jobs_invalid_claim",
      "Resource indexing job claim requires a worker identifier.",
    );
  }

  if (!Number.isSafeInteger(input.limit) || input.limit <= 0) {
    throw new ResourceIndexingJobsRepositoryError(
      "resource_indexing_jobs_invalid_claim",
      "Resource indexing job claim requires a positive limit.",
    );
  }

  if (
    !Number.isSafeInteger(input.staleClaimThresholdSeconds)
    || input.staleClaimThresholdSeconds <= 0
  ) {
    throw new ResourceIndexingJobsRepositoryError(
      "resource_indexing_jobs_invalid_claim",
      "Resource indexing job claim requires a positive stale-claim threshold.",
    );
  }
}

function assertValidPayload(payload: DbResourceIndexingJobPayload): void {
  if (payload.embeddingStrategyVersion.length === 0) {
    throw new ResourceIndexingJobsRepositoryError(
      "resource_indexing_jobs_invalid_payload",
      "Resource indexing job payload requires an embedding strategy version.",
    );
  }

  if (payload.requestedAt.length === 0) {
    throw new ResourceIndexingJobsRepositoryError(
      "resource_indexing_jobs_invalid_payload",
      "Resource indexing job payload requires a requested-at timestamp.",
    );
  }
}

function mapClaimedResourceIndexingJobRow(
  row: Database["public"]["Tables"]["resource_indexing_jobs"]["Row"],
): ClaimedDbResourceIndexingJobRecord {
  const mapped = mapResourceIndexingJobRow(row);

  if (mapped.status !== "claimed" || mapped.lockedAt === null || mapped.lockedBy === null) {
    throw new ResourceIndexingJobsRepositoryError(
      "resource_indexing_jobs_claim_failed",
      "Resource indexing job row is not in a claimed state.",
    );
  }

  return {
    ...mapped,
    status: "claimed",
    lockedAt: mapped.lockedAt,
    lockedBy: mapped.lockedBy,
  };
}

function mapResourceIndexingJobRow(
  row: Database["public"]["Tables"]["resource_indexing_jobs"]["Row"],
): DbResourceIndexingJobRecord {
  return {
    jobId: row.job_id as JobId,
    studentId: row.student_id as StudentId,
    resourceId: row.resource_id as ResourceId,
    jobName: row.job_name as "retrieval.index.resource",
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

function mapPayload(payload: Json): DbResourceIndexingJobPayload {
  if (!isJsonObject(payload)) {
    throwInvalidPayloadShape();
  }

  const studentId = payload["studentId"];
  const resourceId = payload["resourceId"];
  const embeddingStrategyVersion = payload["embeddingStrategyVersion"];
  const chunkingStrategyVersion = payload["chunkingStrategyVersion"];
  const sourceContentHash = payload["sourceContentHash"];
  const requestedAt = payload["requestedAt"];

  if (
    typeof studentId !== "string"
    || typeof resourceId !== "string"
    || typeof embeddingStrategyVersion !== "string"
    || (chunkingStrategyVersion !== null && typeof chunkingStrategyVersion !== "string")
    || (sourceContentHash !== null && typeof sourceContentHash !== "string")
    || typeof requestedAt !== "string"
  ) {
    throwInvalidPayloadShape();
  }

  return {
    studentId: studentId as StudentId,
    resourceId: resourceId as ResourceId,
    embeddingStrategyVersion,
    chunkingStrategyVersion,
    sourceContentHash,
    requestedAt: requestedAt as IsoDateTimeString,
  };
}

function isJsonObject(value: unknown): value is Record<string, Json> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function throwInvalidPayloadShape(): never {
  throw new ResourceIndexingJobsRepositoryError(
    "resource_indexing_jobs_invalid_payload",
    "Resource indexing job payload has an unsupported shape.",
  );
}
