import type { JobId, ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "../../generated/database.types.js";
import type {
  ClaimedDbResourceClassificationJobRecord,
  ClaimQueuedResourceClassificationJobsInput,
  CompleteResourceClassificationJobInput,
  FailResourceClassificationJobInput,
  RecordResourceClassificationJobHeartbeatInput,
  ReleaseResourceClassificationJobInput,
} from "./claim.js";

export type DbResourceClassificationJobStatus =
  Database["public"]["Enums"]["resource_classification_job_status"];

export type DbResourceClassificationJobPriority =
  Database["public"]["Enums"]["resource_classification_job_priority"];

export type DbResourceClassificationJobReason =
  Database["public"]["Enums"]["resource_classification_job_reason"];

export type DbResourceClassificationJobPayload = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  classificationStrategyVersion: string;
  placementPolicyVersion: string;
  requestedAt: IsoDateTimeString;
}>;

export type DbResourceClassificationJobRecord = Readonly<{
  jobId: JobId;
  studentId: StudentId;
  resourceId: ResourceId;
  jobName: "resource.classification.requested";
  reason: DbResourceClassificationJobReason;
  priority: DbResourceClassificationJobPriority;
  status: DbResourceClassificationJobStatus;
  attemptCount: number;
  payload: DbResourceClassificationJobPayload;
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

export type CreateResourceClassificationJobInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  jobName: "resource.classification.requested";
  reason: DbResourceClassificationJobReason;
  priority: DbResourceClassificationJobPriority;
  payload: DbResourceClassificationJobPayload;
}>;

export type GetResourceClassificationJobByIdInput = Readonly<{
  studentId: StudentId;
  jobId: JobId;
}>;

export type ResourceClassificationJobsRepository = Readonly<{
  enqueueResourceClassificationJob: (
    input: CreateResourceClassificationJobInput,
  ) => Promise<DbResourceClassificationJobRecord>;
  getResourceClassificationJobById: (
    input: GetResourceClassificationJobByIdInput,
  ) => Promise<DbResourceClassificationJobRecord | null>;
  claimQueuedResourceClassificationJobs: (
    input: ClaimQueuedResourceClassificationJobsInput,
  ) => Promise<readonly ClaimedDbResourceClassificationJobRecord[]>;
  recordResourceClassificationJobHeartbeat: (
    input: RecordResourceClassificationJobHeartbeatInput,
  ) => Promise<ClaimedDbResourceClassificationJobRecord>;
  releaseResourceClassificationJob: (
    input: ReleaseResourceClassificationJobInput,
  ) => Promise<DbResourceClassificationJobRecord>;
  completeResourceClassificationJob: (
    input: CompleteResourceClassificationJobInput,
  ) => Promise<DbResourceClassificationJobRecord>;
  failResourceClassificationJob: (
    input: FailResourceClassificationJobInput,
  ) => Promise<DbResourceClassificationJobRecord>;
}>;

export type CreateResourceClassificationJobsRepositoryInput = Readonly<{
  client: SupabaseClient<Database>;
}>;

export type ResourceClassificationJobsRepositoryErrorCode =
  | "resource_classification_jobs_invalid_payload"
  | "resource_classification_jobs_invalid_claim"
  | "resource_classification_jobs_insert_failed"
  | "resource_classification_jobs_read_failed"
  | "resource_classification_jobs_claim_failed"
  | "resource_classification_jobs_completion_failed"
  | "resource_classification_jobs_heartbeat_failed"
  | "resource_classification_jobs_release_failed"
  | "resource_classification_jobs_failure_record_failed";

export class ResourceClassificationJobsRepositoryError extends Error {
  public readonly code: ResourceClassificationJobsRepositoryErrorCode;

  public constructor(code: ResourceClassificationJobsRepositoryErrorCode, message: string) {
    super(message);
    this.name = "ResourceClassificationJobsRepositoryError";
    this.code = code;
  }
}

const resourceClassificationJobSelectColumns =
  "job_id,student_id,resource_id,job_name,reason,priority,status,attempt_count,payload,locked_at,locked_by,heartbeat_at,available_at,enqueued_at,started_at,completed_at,failed_at,last_error,created_at,updated_at" as const;

export function createResourceClassificationJobsRepository(
  input: CreateResourceClassificationJobsRepositoryInput,
): ResourceClassificationJobsRepository {
  return {
    enqueueResourceClassificationJob: async (
      job: CreateResourceClassificationJobInput,
    ): Promise<DbResourceClassificationJobRecord> => {
      assertValidPayload(job.payload);

      const { data, error } = await input.client
        .from("resource_classification_jobs")
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
        .select(resourceClassificationJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceClassificationJobsRepositoryError(
          "resource_classification_jobs_insert_failed",
          error.message,
        );
      }

      return mapResourceClassificationJobRow(data);
    },

    getResourceClassificationJobById: async (
      lookup: GetResourceClassificationJobByIdInput,
    ): Promise<DbResourceClassificationJobRecord | null> => {
      const { data, error } = await input.client
        .from("resource_classification_jobs")
        .select(resourceClassificationJobSelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("job_id", lookup.jobId)
        .maybeSingle();

      if (error !== null) {
        throw new ResourceClassificationJobsRepositoryError(
          "resource_classification_jobs_read_failed",
          error.message,
        );
      }

      if (data === null) {
        return null;
      }

      return mapResourceClassificationJobRow(data);
    },

    claimQueuedResourceClassificationJobs: async (
      claim: ClaimQueuedResourceClassificationJobsInput,
    ): Promise<readonly ClaimedDbResourceClassificationJobRecord[]> => {
      assertValidClaimInput(claim);

      const staleClaimCutoff = new Date(
        Date.now() - claim.staleClaimThresholdSeconds * 1000,
      ).toISOString();

      const { data: candidates, error: readError } = await input.client
        .from("resource_classification_jobs")
        .select(resourceClassificationJobSelectColumns)
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
        throw new ResourceClassificationJobsRepositoryError(
          "resource_classification_jobs_claim_failed",
          readError.message,
        );
      }

      const claimedJobs: ClaimedDbResourceClassificationJobRecord[] = [];

      for (const candidate of candidates) {
        const { data: claimed, error: updateError } = await input.client
          .from("resource_classification_jobs")
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
          .select(resourceClassificationJobSelectColumns)
          .maybeSingle();

        if (updateError !== null) {
          throw new ResourceClassificationJobsRepositoryError(
            "resource_classification_jobs_claim_failed",
            updateError.message,
          );
        }

        if (claimed !== null) {
          claimedJobs.push(mapClaimedResourceClassificationJobRow(claimed));
        }
      }

      return claimedJobs;
    },

    recordResourceClassificationJobHeartbeat: async (
      heartbeat: RecordResourceClassificationJobHeartbeatInput,
    ): Promise<ClaimedDbResourceClassificationJobRecord> => {
      const { data, error } = await input.client
        .from("resource_classification_jobs")
        .update({
          heartbeat_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("job_id", heartbeat.jobId)
        .eq("locked_by", heartbeat.workerId)
        .eq("status", "claimed")
        .select(resourceClassificationJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceClassificationJobsRepositoryError(
          "resource_classification_jobs_heartbeat_failed",
          error.message,
        );
      }

      return mapClaimedResourceClassificationJobRow(data);
    },

    releaseResourceClassificationJob: async (
      release: ReleaseResourceClassificationJobInput,
    ): Promise<DbResourceClassificationJobRecord> => {
      const { data, error } = await input.client
        .from("resource_classification_jobs")
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
        .select(resourceClassificationJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceClassificationJobsRepositoryError(
          "resource_classification_jobs_release_failed",
          error.message,
        );
      }

      return mapResourceClassificationJobRow(data);
    },

    failResourceClassificationJob: async (
      failure: FailResourceClassificationJobInput,
    ): Promise<DbResourceClassificationJobRecord> => {
      const { data, error } = await input.client
        .from("resource_classification_jobs")
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
        .select(resourceClassificationJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceClassificationJobsRepositoryError(
          "resource_classification_jobs_failure_record_failed",
          error.message,
        );
      }

      return mapResourceClassificationJobRow(data);
    },

    completeResourceClassificationJob: async (
      completion: CompleteResourceClassificationJobInput,
    ): Promise<DbResourceClassificationJobRecord> => {
      const { data, error } = await input.client
        .from("resource_classification_jobs")
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
        .select(resourceClassificationJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceClassificationJobsRepositoryError(
          "resource_classification_jobs_completion_failed",
          error.message,
        );
      }

      return mapResourceClassificationJobRow(data);
    },
  };
}

function assertValidClaimInput(input: ClaimQueuedResourceClassificationJobsInput): void {
  if (input.workerId.length === 0) {
    throw new ResourceClassificationJobsRepositoryError(
      "resource_classification_jobs_invalid_claim",
      "Resource classification job claim requires a worker identifier.",
    );
  }

  if (!Number.isSafeInteger(input.limit) || input.limit <= 0) {
    throw new ResourceClassificationJobsRepositoryError(
      "resource_classification_jobs_invalid_claim",
      "Resource classification job claim requires a positive limit.",
    );
  }

  if (
    !Number.isSafeInteger(input.staleClaimThresholdSeconds)
    || input.staleClaimThresholdSeconds <= 0
  ) {
    throw new ResourceClassificationJobsRepositoryError(
      "resource_classification_jobs_invalid_claim",
      "Resource classification job claim requires a positive stale-claim threshold.",
    );
  }
}

function assertValidPayload(payload: DbResourceClassificationJobPayload): void {
  if (payload.classificationStrategyVersion.length === 0) {
    throw new ResourceClassificationJobsRepositoryError(
      "resource_classification_jobs_invalid_payload",
      "Resource classification job payload requires a classification strategy version.",
    );
  }

  if (payload.placementPolicyVersion.length === 0) {
    throw new ResourceClassificationJobsRepositoryError(
      "resource_classification_jobs_invalid_payload",
      "Resource classification job payload requires a placement policy version.",
    );
  }

  if (payload.requestedAt.length === 0) {
    throw new ResourceClassificationJobsRepositoryError(
      "resource_classification_jobs_invalid_payload",
      "Resource classification job payload requires a requested-at timestamp.",
    );
  }
}

function mapClaimedResourceClassificationJobRow(
  row: Database["public"]["Tables"]["resource_classification_jobs"]["Row"],
): ClaimedDbResourceClassificationJobRecord {
  const mapped = mapResourceClassificationJobRow(row);

  if (mapped.status !== "claimed" || mapped.lockedAt === null || mapped.lockedBy === null) {
    throw new ResourceClassificationJobsRepositoryError(
      "resource_classification_jobs_claim_failed",
      "Resource classification job row is not in a claimed state.",
    );
  }

  return {
    ...mapped,
    status: "claimed",
    lockedAt: mapped.lockedAt,
    lockedBy: mapped.lockedBy,
  };
}

function mapResourceClassificationJobRow(
  row: Database["public"]["Tables"]["resource_classification_jobs"]["Row"],
): DbResourceClassificationJobRecord {
  return {
    jobId: row.job_id as JobId,
    studentId: row.student_id as StudentId,
    resourceId: row.resource_id as ResourceId,
    jobName: row.job_name as "resource.classification.requested",
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

function mapPayload(payload: Json): DbResourceClassificationJobPayload {
  if (!isJsonObject(payload)) {
    throwInvalidPayloadShape();
  }

  const studentId = payload["studentId"];
  const resourceId = payload["resourceId"];
  const classificationStrategyVersion = payload["classificationStrategyVersion"];
  const placementPolicyVersion = payload["placementPolicyVersion"];
  const requestedAt = payload["requestedAt"];

  if (
    typeof studentId !== "string"
    || typeof resourceId !== "string"
    || typeof classificationStrategyVersion !== "string"
    || typeof placementPolicyVersion !== "string"
    || typeof requestedAt !== "string"
  ) {
    throwInvalidPayloadShape();
  }

  return {
    studentId: studentId as StudentId,
    resourceId: resourceId as ResourceId,
    classificationStrategyVersion,
    placementPolicyVersion,
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
  throw new ResourceClassificationJobsRepositoryError(
    "resource_classification_jobs_invalid_payload",
    "Resource classification job payload has an unsupported shape.",
  );
}
