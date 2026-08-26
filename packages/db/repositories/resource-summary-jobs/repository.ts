import type { JobId, ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "../../generated/database.types.js";
import type {
  ClaimedDbResourceSummaryJobRecord,
  ClaimQueuedResourceSummaryJobsInput,
  CompleteResourceSummaryJobInput,
  FailResourceSummaryJobInput,
  RecordResourceSummaryJobHeartbeatInput,
  ReleaseResourceSummaryJobInput,
} from "./claim.js";

export type DbResourceSummaryJobStatus =
  Database["public"]["Enums"]["resource_summary_job_status"];

export type DbResourceSummaryJobPriority =
  Database["public"]["Enums"]["resource_summary_job_priority"];

export type DbResourceSummaryJobReason =
  Database["public"]["Enums"]["resource_summary_job_reason"];

export type DbResourceSummaryJobPayload = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  promptVersion: string;
  summaryStrategyVersion: string;
  requestedAt: IsoDateTimeString;
}>;

export type DbResourceSummaryJobRecord = Readonly<{
  jobId: JobId;
  studentId: StudentId;
  resourceId: ResourceId;
  jobName: "summary.generate.requested";
  reason: DbResourceSummaryJobReason;
  priority: DbResourceSummaryJobPriority;
  status: DbResourceSummaryJobStatus;
  attemptCount: number;
  payload: DbResourceSummaryJobPayload;
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

export type CreateResourceSummaryJobInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  jobName: "summary.generate.requested";
  reason: DbResourceSummaryJobReason;
  priority: DbResourceSummaryJobPriority;
  payload: DbResourceSummaryJobPayload;
}>;

export type GetResourceSummaryJobByIdInput = Readonly<{
  studentId: StudentId;
  jobId: JobId;
}>;

export type ResourceSummaryJobsRepository = Readonly<{
  enqueueResourceSummaryJob: (
    input: CreateResourceSummaryJobInput,
  ) => Promise<DbResourceSummaryJobRecord>;
  getResourceSummaryJobById: (
    input: GetResourceSummaryJobByIdInput,
  ) => Promise<DbResourceSummaryJobRecord | null>;
  claimQueuedResourceSummaryJobs: (
    input: ClaimQueuedResourceSummaryJobsInput,
  ) => Promise<readonly ClaimedDbResourceSummaryJobRecord[]>;
  recordResourceSummaryJobHeartbeat: (
    input: RecordResourceSummaryJobHeartbeatInput,
  ) => Promise<ClaimedDbResourceSummaryJobRecord>;
  releaseResourceSummaryJob: (
    input: ReleaseResourceSummaryJobInput,
  ) => Promise<DbResourceSummaryJobRecord>;
  completeResourceSummaryJob: (
    input: CompleteResourceSummaryJobInput,
  ) => Promise<DbResourceSummaryJobRecord>;
  failResourceSummaryJob: (
    input: FailResourceSummaryJobInput,
  ) => Promise<DbResourceSummaryJobRecord>;
}>;

export type CreateResourceSummaryJobsRepositoryInput = Readonly<{
  client: SupabaseClient<Database>;
}>;

export type ResourceSummaryJobsRepositoryErrorCode =
  | "resource_summary_jobs_invalid_payload"
  | "resource_summary_jobs_invalid_claim"
  | "resource_summary_jobs_insert_failed"
  | "resource_summary_jobs_read_failed"
  | "resource_summary_jobs_claim_failed"
  | "resource_summary_jobs_completion_failed"
  | "resource_summary_jobs_heartbeat_failed"
  | "resource_summary_jobs_release_failed"
  | "resource_summary_jobs_failure_record_failed";

export class ResourceSummaryJobsRepositoryError extends Error {
  public readonly code: ResourceSummaryJobsRepositoryErrorCode;

  public constructor(code: ResourceSummaryJobsRepositoryErrorCode, message: string) {
    super(message);
    this.name = "ResourceSummaryJobsRepositoryError";
    this.code = code;
  }
}

const resourceSummaryJobSelectColumns =
  "job_id,student_id,resource_id,job_name,reason,priority,status,attempt_count,payload,locked_at,locked_by,heartbeat_at,available_at,enqueued_at,started_at,completed_at,failed_at,last_error,created_at,updated_at" as const;

export function createResourceSummaryJobsRepository(
  input: CreateResourceSummaryJobsRepositoryInput,
): ResourceSummaryJobsRepository {
  return {
    enqueueResourceSummaryJob: async (
      job: CreateResourceSummaryJobInput,
    ): Promise<DbResourceSummaryJobRecord> => {
      assertValidPayload(job.payload);

      const { data, error } = await input.client
        .from("resource_summary_jobs")
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
        .select(resourceSummaryJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceSummaryJobsRepositoryError(
          "resource_summary_jobs_insert_failed",
          error.message,
        );
      }

      return mapResourceSummaryJobRow(data);
    },

    getResourceSummaryJobById: async (
      lookup: GetResourceSummaryJobByIdInput,
    ): Promise<DbResourceSummaryJobRecord | null> => {
      const { data, error } = await input.client
        .from("resource_summary_jobs")
        .select(resourceSummaryJobSelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("job_id", lookup.jobId)
        .maybeSingle();

      if (error !== null) {
        throw new ResourceSummaryJobsRepositoryError(
          "resource_summary_jobs_read_failed",
          error.message,
        );
      }

      if (data === null) {
        return null;
      }

      return mapResourceSummaryJobRow(data);
    },

    claimQueuedResourceSummaryJobs: async (
      claim: ClaimQueuedResourceSummaryJobsInput,
    ): Promise<readonly ClaimedDbResourceSummaryJobRecord[]> => {
      assertValidClaimInput(claim);

      const staleClaimCutoff = new Date(
        Date.now() - claim.staleClaimThresholdSeconds * 1000,
      ).toISOString();

      const { data: candidates, error: readError } = await input.client
        .from("resource_summary_jobs")
        .select(resourceSummaryJobSelectColumns)
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
        throw new ResourceSummaryJobsRepositoryError(
          "resource_summary_jobs_claim_failed",
          readError.message,
        );
      }

      const claimedJobs: ClaimedDbResourceSummaryJobRecord[] = [];

      for (const candidate of candidates) {
        const { data: claimed, error: updateError } = await input.client
          .from("resource_summary_jobs")
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
          .select(resourceSummaryJobSelectColumns)
          .maybeSingle();

        if (updateError !== null) {
          throw new ResourceSummaryJobsRepositoryError(
            "resource_summary_jobs_claim_failed",
            updateError.message,
          );
        }

        if (claimed !== null) {
          claimedJobs.push(mapClaimedResourceSummaryJobRow(claimed));
        }
      }

      return claimedJobs;
    },

    recordResourceSummaryJobHeartbeat: async (
      heartbeat: RecordResourceSummaryJobHeartbeatInput,
    ): Promise<ClaimedDbResourceSummaryJobRecord> => {
      const { data, error } = await input.client
        .from("resource_summary_jobs")
        .update({
          heartbeat_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("job_id", heartbeat.jobId)
        .eq("locked_by", heartbeat.workerId)
        .eq("status", "claimed")
        .select(resourceSummaryJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceSummaryJobsRepositoryError(
          "resource_summary_jobs_heartbeat_failed",
          error.message,
        );
      }

      return mapClaimedResourceSummaryJobRow(data);
    },

    releaseResourceSummaryJob: async (
      release: ReleaseResourceSummaryJobInput,
    ): Promise<DbResourceSummaryJobRecord> => {
      const { data, error } = await input.client
        .from("resource_summary_jobs")
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
        .select(resourceSummaryJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceSummaryJobsRepositoryError(
          "resource_summary_jobs_release_failed",
          error.message,
        );
      }

      return mapResourceSummaryJobRow(data);
    },

    failResourceSummaryJob: async (
      failure: FailResourceSummaryJobInput,
    ): Promise<DbResourceSummaryJobRecord> => {
      const { data, error } = await input.client
        .from("resource_summary_jobs")
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
        .select(resourceSummaryJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceSummaryJobsRepositoryError(
          "resource_summary_jobs_failure_record_failed",
          error.message,
        );
      }

      return mapResourceSummaryJobRow(data);
    },

    completeResourceSummaryJob: async (
      completion: CompleteResourceSummaryJobInput,
    ): Promise<DbResourceSummaryJobRecord> => {
      const { data, error } = await input.client
        .from("resource_summary_jobs")
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
        .select(resourceSummaryJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceSummaryJobsRepositoryError(
          "resource_summary_jobs_completion_failed",
          error.message,
        );
      }

      return mapResourceSummaryJobRow(data);
    },
  };
}

function assertValidClaimInput(input: ClaimQueuedResourceSummaryJobsInput): void {
  if (input.workerId.length === 0) {
    throw new ResourceSummaryJobsRepositoryError(
      "resource_summary_jobs_invalid_claim",
      "Resource summary job claim requires a worker identifier.",
    );
  }

  if (!Number.isSafeInteger(input.limit) || input.limit <= 0) {
    throw new ResourceSummaryJobsRepositoryError(
      "resource_summary_jobs_invalid_claim",
      "Resource summary job claim requires a positive limit.",
    );
  }

  if (
    !Number.isSafeInteger(input.staleClaimThresholdSeconds)
    || input.staleClaimThresholdSeconds <= 0
  ) {
    throw new ResourceSummaryJobsRepositoryError(
      "resource_summary_jobs_invalid_claim",
      "Resource summary job claim requires a positive stale-claim threshold.",
    );
  }
}

function assertValidPayload(payload: DbResourceSummaryJobPayload): void {
  if (payload.promptVersion.length === 0) {
    throw new ResourceSummaryJobsRepositoryError(
      "resource_summary_jobs_invalid_payload",
      "Resource summary job payload requires a prompt version.",
    );
  }

  if (payload.summaryStrategyVersion.length === 0) {
    throw new ResourceSummaryJobsRepositoryError(
      "resource_summary_jobs_invalid_payload",
      "Resource summary job payload requires a summary strategy version.",
    );
  }

  if (payload.requestedAt.length === 0) {
    throw new ResourceSummaryJobsRepositoryError(
      "resource_summary_jobs_invalid_payload",
      "Resource summary job payload requires a requested-at timestamp.",
    );
  }
}

function mapClaimedResourceSummaryJobRow(
  row: Database["public"]["Tables"]["resource_summary_jobs"]["Row"],
): ClaimedDbResourceSummaryJobRecord {
  const mapped = mapResourceSummaryJobRow(row);

  if (mapped.status !== "claimed" || mapped.lockedAt === null || mapped.lockedBy === null) {
    throw new ResourceSummaryJobsRepositoryError(
      "resource_summary_jobs_claim_failed",
      "Resource summary job row is not in a claimed state.",
    );
  }

  return {
    ...mapped,
    status: "claimed",
    lockedAt: mapped.lockedAt,
    lockedBy: mapped.lockedBy,
  };
}

function mapResourceSummaryJobRow(
  row: Database["public"]["Tables"]["resource_summary_jobs"]["Row"],
): DbResourceSummaryJobRecord {
  return {
    jobId: row.job_id as JobId,
    studentId: row.student_id as StudentId,
    resourceId: row.resource_id as ResourceId,
    jobName: row.job_name as "summary.generate.requested",
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

function mapPayload(payload: Json): DbResourceSummaryJobPayload {
  if (!isJsonObject(payload)) {
    throwInvalidPayloadShape();
  }

  const studentId = payload["studentId"];
  const resourceId = payload["resourceId"];
  const promptVersion = payload["promptVersion"];
  const summaryStrategyVersion = payload["summaryStrategyVersion"];
  const requestedAt = payload["requestedAt"];

  if (
    typeof studentId !== "string"
    || typeof resourceId !== "string"
    || typeof promptVersion !== "string"
    || typeof summaryStrategyVersion !== "string"
    || typeof requestedAt !== "string"
  ) {
    throwInvalidPayloadShape();
  }

  return {
    studentId: studentId as StudentId,
    resourceId: resourceId as ResourceId,
    promptVersion,
    summaryStrategyVersion,
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
  throw new ResourceSummaryJobsRepositoryError(
    "resource_summary_jobs_invalid_payload",
    "Resource summary job payload has an unsupported shape.",
  );
}
