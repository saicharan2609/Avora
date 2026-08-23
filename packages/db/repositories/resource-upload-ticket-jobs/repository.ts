import type { JobId, ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "../../generated/database.types.js";

export type DbResourceUploadTicketJobStatus =
  Database["public"]["Enums"]["resource_upload_ticket_job_status"];

export type DbResourceUploadTicketJobPriority =
  Database["public"]["Enums"]["resource_upload_ticket_job_priority"];

export type DbResourceUploadTicketJobReason =
  Database["public"]["Enums"]["resource_upload_ticket_job_reason"];

export type DbResourceUploadTicketJobBucket = "quarantine";

export type DbResourceUploadTicketJobPayload = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  bucket: DbResourceUploadTicketJobBucket;
  objectPath: string;
  version: number;
  byteSize: number;
  declaredMimeType: string;
}>;

export type DbResourceUploadTicketJobResult = Readonly<{
  storage: Readonly<{
    bucket: DbResourceUploadTicketJobBucket;
    objectPath: string;
    version: number;
  }>;
  uploadUrl: string;
  expiresAt: IsoDateTimeString;
}>;

export type DbResourceUploadTicketJobRecord = Readonly<{
  jobId: JobId;
  studentId: StudentId;
  resourceId: ResourceId;
  jobName: "resource.upload_ticket.create";
  reason: DbResourceUploadTicketJobReason;
  priority: DbResourceUploadTicketJobPriority;
  status: DbResourceUploadTicketJobStatus;
  attemptCount: number;
  payload: DbResourceUploadTicketJobPayload;
  result: DbResourceUploadTicketJobResult | null;
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

export type CreateResourceUploadTicketJobInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  reason: DbResourceUploadTicketJobReason;
  priority: DbResourceUploadTicketJobPriority;
  payload: DbResourceUploadTicketJobPayload;
}>;

export type GetResourceUploadTicketJobByIdInput = Readonly<{
  studentId: StudentId;
  jobId: JobId;
}>;

export type ClaimQueuedResourceUploadTicketJobsInput = Readonly<{
  workerId: string;
  limit: number;
  staleClaimThresholdSeconds: number;
}>;

export type ClaimedDbResourceUploadTicketJobRecord = DbResourceUploadTicketJobRecord &
  Readonly<{
    status: "claimed";
    lockedAt: IsoDateTimeString;
    lockedBy: string;
  }>;

export type CompleteResourceUploadTicketJobInput = Readonly<{
  jobId: JobId;
  workerId: string;
  result: DbResourceUploadTicketJobResult;
}>;

export type FailResourceUploadTicketJobInput = Readonly<{
  jobId: JobId;
  workerId: string;
  errorMessage: string;
}>;

export type ResourceUploadTicketJobsRepository = Readonly<{
  enqueueResourceUploadTicketJob: (
    input: CreateResourceUploadTicketJobInput,
  ) => Promise<DbResourceUploadTicketJobRecord>;
  getResourceUploadTicketJobById: (
    input: GetResourceUploadTicketJobByIdInput,
  ) => Promise<DbResourceUploadTicketJobRecord | null>;
  claimQueuedResourceUploadTicketJobs: (
    input: ClaimQueuedResourceUploadTicketJobsInput,
  ) => Promise<readonly ClaimedDbResourceUploadTicketJobRecord[]>;
  completeResourceUploadTicketJob: (
    input: CompleteResourceUploadTicketJobInput,
  ) => Promise<DbResourceUploadTicketJobRecord>;
  failResourceUploadTicketJob: (
    input: FailResourceUploadTicketJobInput,
  ) => Promise<DbResourceUploadTicketJobRecord>;
}>;

export type CreateResourceUploadTicketJobsRepositoryInput = Readonly<{
  client: SupabaseClient<Database>;
}>;

export type ResourceUploadTicketJobsRepositoryErrorCode =
  | "resource_upload_ticket_jobs_invalid_payload"
  | "resource_upload_ticket_jobs_invalid_claim"
  | "resource_upload_ticket_jobs_insert_failed"
  | "resource_upload_ticket_jobs_read_failed"
  | "resource_upload_ticket_jobs_claim_failed"
  | "resource_upload_ticket_jobs_completion_failed"
  | "resource_upload_ticket_jobs_failure_record_failed";

export class ResourceUploadTicketJobsRepositoryError extends Error {
  public readonly code: ResourceUploadTicketJobsRepositoryErrorCode;

  public constructor(
    code: ResourceUploadTicketJobsRepositoryErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ResourceUploadTicketJobsRepositoryError";
    this.code = code;
  }
}

const resourceUploadTicketJobSelectColumns =
  "job_id,student_id,resource_id,job_name,reason,priority,status,attempt_count,payload,result,locked_at,locked_by,heartbeat_at,available_at,enqueued_at,started_at,completed_at,failed_at,last_error,created_at,updated_at" as const;

const postgresUniqueViolationErrorCode = "23505" as const;

const activeResourceUploadTicketJobStatuses = [
  "queued",
  "claimed",
  "running",
] as const;

async function findActiveResourceUploadTicketJob(
  client: SupabaseClient<Database>,
  job: CreateResourceUploadTicketJobInput,
): Promise<DbResourceUploadTicketJobRecord | null> {
  const { data, error } = await client
    .from("resource_upload_ticket_jobs")
    .select(resourceUploadTicketJobSelectColumns)
    .eq("student_id", job.studentId)
    .eq("resource_id", job.resourceId)
    .in("status", activeResourceUploadTicketJobStatuses)
    .maybeSingle();

  if (error !== null) {
    throw new ResourceUploadTicketJobsRepositoryError(
      "resource_upload_ticket_jobs_insert_failed",
      error.message,
    );
  }

  return data === null ? null : mapResourceUploadTicketJobRow(data);
}

export function createResourceUploadTicketJobsRepository(
  input: CreateResourceUploadTicketJobsRepositoryInput,
): ResourceUploadTicketJobsRepository {
  return {
    enqueueResourceUploadTicketJob: async (
      job: CreateResourceUploadTicketJobInput,
    ): Promise<DbResourceUploadTicketJobRecord> => {
      assertValidPayload(job.payload);

      const { data, error } = await input.client
        .from("resource_upload_ticket_jobs")
        .insert({
          student_id: job.studentId,
          resource_id: job.resourceId,
          job_name: "resource.upload_ticket.create",
          reason: job.reason,
          priority: job.priority,
          status: "queued",
          attempt_count: 0,
          payload: job.payload as unknown as Json,
        })
        .select(resourceUploadTicketJobSelectColumns)
        .single();

      if (error !== null) {
        if (error.code === postgresUniqueViolationErrorCode) {
          const existingActiveJob = await findActiveResourceUploadTicketJob(
            input.client,
            job,
          );

          if (existingActiveJob !== null) {
            return existingActiveJob;
          }
        }

        throw new ResourceUploadTicketJobsRepositoryError(
          "resource_upload_ticket_jobs_insert_failed",
          error.message,
        );
      }

      return mapResourceUploadTicketJobRow(data);
    },

    getResourceUploadTicketJobById: async (
      lookup: GetResourceUploadTicketJobByIdInput,
    ): Promise<DbResourceUploadTicketJobRecord | null> => {
      const { data, error } = await input.client
        .from("resource_upload_ticket_jobs")
        .select(resourceUploadTicketJobSelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("job_id", lookup.jobId)
        .maybeSingle();

      if (error !== null) {
        throw new ResourceUploadTicketJobsRepositoryError(
          "resource_upload_ticket_jobs_read_failed",
          error.message,
        );
      }

      if (data === null) {
        return null;
      }

      return mapResourceUploadTicketJobRow(data);
    },

    claimQueuedResourceUploadTicketJobs: async (
      claim: ClaimQueuedResourceUploadTicketJobsInput,
    ): Promise<readonly ClaimedDbResourceUploadTicketJobRecord[]> => {
      assertValidClaimInput(claim);

      const staleClaimCutoff = new Date(
        Date.now() - claim.staleClaimThresholdSeconds * 1000,
      ).toISOString();

      const { data: candidates, error: readError } = await input.client
        .from("resource_upload_ticket_jobs")
        .select(resourceUploadTicketJobSelectColumns)
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
        throw new ResourceUploadTicketJobsRepositoryError(
          "resource_upload_ticket_jobs_claim_failed",
          readError.message,
        );
      }

      const claimedJobs: ClaimedDbResourceUploadTicketJobRecord[] = [];

      for (const candidate of candidates) {
        const { data: claimed, error: updateError } = await input.client
          .from("resource_upload_ticket_jobs")
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
          .select(resourceUploadTicketJobSelectColumns)
          .maybeSingle();

        if (updateError !== null) {
          throw new ResourceUploadTicketJobsRepositoryError(
            "resource_upload_ticket_jobs_claim_failed",
            updateError.message,
          );
        }

        if (claimed !== null) {
          claimedJobs.push(mapClaimedResourceUploadTicketJobRow(claimed));
        }
      }

      return claimedJobs;
    },

    completeResourceUploadTicketJob: async (
      completion: CompleteResourceUploadTicketJobInput,
    ): Promise<DbResourceUploadTicketJobRecord> => {
      const { data, error } = await input.client
        .from("resource_upload_ticket_jobs")
        .update({
          status: "succeeded",
          locked_at: null,
          locked_by: null,
          heartbeat_at: null,
          completed_at: new Date().toISOString(),
          result: completion.result as unknown as Json,
          updated_at: new Date().toISOString(),
        })
        .eq("job_id", completion.jobId)
        .eq("locked_by", completion.workerId)
        .eq("status", "claimed")
        .select(resourceUploadTicketJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceUploadTicketJobsRepositoryError(
          "resource_upload_ticket_jobs_completion_failed",
          error.message,
        );
      }

      return mapResourceUploadTicketJobRow(data);
    },

    failResourceUploadTicketJob: async (
      failure: FailResourceUploadTicketJobInput,
    ): Promise<DbResourceUploadTicketJobRecord> => {
      const { data, error } = await input.client
        .from("resource_upload_ticket_jobs")
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
        .select(resourceUploadTicketJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceUploadTicketJobsRepositoryError(
          "resource_upload_ticket_jobs_failure_record_failed",
          error.message,
        );
      }

      return mapResourceUploadTicketJobRow(data);
    },
  };
}

function assertValidClaimInput(
  input: ClaimQueuedResourceUploadTicketJobsInput,
): void {
  if (input.workerId.length === 0) {
    throw new ResourceUploadTicketJobsRepositoryError(
      "resource_upload_ticket_jobs_invalid_claim",
      "Resource upload ticket job claim requires a worker identifier.",
    );
  }

  if (!Number.isSafeInteger(input.limit) || input.limit <= 0) {
    throw new ResourceUploadTicketJobsRepositoryError(
      "resource_upload_ticket_jobs_invalid_claim",
      "Resource upload ticket job claim requires a positive limit.",
    );
  }

  if (
    !Number.isSafeInteger(input.staleClaimThresholdSeconds)
    || input.staleClaimThresholdSeconds <= 0
  ) {
    throw new ResourceUploadTicketJobsRepositoryError(
      "resource_upload_ticket_jobs_invalid_claim",
      "Resource upload ticket job claim requires a positive stale-claim threshold.",
    );
  }
}

function assertValidPayload(payload: DbResourceUploadTicketJobPayload): void {
  if (payload.objectPath.length === 0) {
    throw new ResourceUploadTicketJobsRepositoryError(
      "resource_upload_ticket_jobs_invalid_payload",
      "Resource upload ticket job payload requires a storage object path.",
    );
  }

  if (payload.version <= 0 || !Number.isSafeInteger(payload.version)) {
    throw new ResourceUploadTicketJobsRepositoryError(
      "resource_upload_ticket_jobs_invalid_payload",
      "Resource upload ticket job payload requires a positive storage version.",
    );
  }

  if (payload.declaredMimeType.length === 0) {
    throw new ResourceUploadTicketJobsRepositoryError(
      "resource_upload_ticket_jobs_invalid_payload",
      "Resource upload ticket job payload requires a declared MIME type.",
    );
  }

  if (!Number.isSafeInteger(payload.byteSize) || payload.byteSize <= 0) {
    throw new ResourceUploadTicketJobsRepositoryError(
      "resource_upload_ticket_jobs_invalid_payload",
      "Resource upload ticket job payload requires a positive byte size.",
    );
  }
}

function mapClaimedResourceUploadTicketJobRow(
  row: Database["public"]["Tables"]["resource_upload_ticket_jobs"]["Row"],
): ClaimedDbResourceUploadTicketJobRecord {
  const mapped = mapResourceUploadTicketJobRow(row);

  if (mapped.status !== "claimed" || mapped.lockedAt === null || mapped.lockedBy === null) {
    throw new ResourceUploadTicketJobsRepositoryError(
      "resource_upload_ticket_jobs_claim_failed",
      "Resource upload ticket job row is not in a claimed state.",
    );
  }

  return {
    ...mapped,
    status: "claimed",
    lockedAt: mapped.lockedAt,
    lockedBy: mapped.lockedBy,
  };
}

function mapResourceUploadTicketJobRow(
  row: Database["public"]["Tables"]["resource_upload_ticket_jobs"]["Row"],
): DbResourceUploadTicketJobRecord {
  return {
    jobId: row.job_id as JobId,
    studentId: row.student_id as StudentId,
    resourceId: row.resource_id as ResourceId,
    jobName: row.job_name,
    reason: row.reason,
    priority: row.priority,
    status: row.status,
    attemptCount: row.attempt_count,
    payload: mapPayload(row.payload),
    result: row.result === null ? null : mapResult(row.result),
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

function mapPayload(payload: Json): DbResourceUploadTicketJobPayload {
  if (!isJsonObject(payload)) {
    throwInvalidPayloadShape();
  }

  const studentId = payload["studentId"];
  const resourceId = payload["resourceId"];
  const bucket = payload["bucket"];
  const objectPath = payload["objectPath"];
  const version = payload["version"];
  const byteSize = payload["byteSize"];
  const declaredMimeType = payload["declaredMimeType"];

  if (
    typeof studentId !== "string"
    || typeof resourceId !== "string"
    || bucket !== "quarantine"
    || typeof objectPath !== "string"
    || typeof version !== "number"
    || typeof byteSize !== "number"
    || typeof declaredMimeType !== "string"
  ) {
    throwInvalidPayloadShape();
  }

  return {
    studentId: studentId as StudentId,
    resourceId: resourceId as ResourceId,
    bucket: "quarantine",
    objectPath,
    version,
    byteSize,
    declaredMimeType,
  };
}

function mapResult(result: Json): DbResourceUploadTicketJobResult {
  if (!isJsonObject(result)) {
    throwInvalidResultShape();
  }

  const storage = result["storage"];
  const uploadUrl = result["uploadUrl"];
  const expiresAt = result["expiresAt"];

  if (!isJsonObject(storage) || typeof uploadUrl !== "string" || typeof expiresAt !== "string") {
    throwInvalidResultShape();
  }

  const bucket = storage["bucket"];
  const objectPath = storage["objectPath"];
  const version = storage["version"];

  if (bucket !== "quarantine" || typeof objectPath !== "string" || typeof version !== "number") {
    throwInvalidResultShape();
  }

  return {
    storage: {
      bucket: "quarantine",
      objectPath,
      version,
    },
    uploadUrl,
    expiresAt: expiresAt as IsoDateTimeString,
  };
}

function isJsonObject(value: unknown): value is Record<string, Json> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function throwInvalidPayloadShape(): never {
  throw new ResourceUploadTicketJobsRepositoryError(
    "resource_upload_ticket_jobs_invalid_payload",
    "Resource upload ticket job payload has an unsupported shape.",
  );
}

function throwInvalidResultShape(): never {
  throw new ResourceUploadTicketJobsRepositoryError(
    "resource_upload_ticket_jobs_completion_failed",
    "Resource upload ticket job result has an unsupported shape.",
  );
}
