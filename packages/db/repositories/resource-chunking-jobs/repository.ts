import type { JobId, ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "../../generated/database.types.js";
import type {
  ClaimedDbResourceChunkingJobRecord,
  ClaimQueuedResourceChunkingJobsInput,
  CompleteResourceChunkingJobInput,
  FailResourceChunkingJobInput,
  RecordResourceChunkingJobHeartbeatInput,
  ReleaseResourceChunkingJobInput,
} from "./claim.js";

export type DbResourceChunkingJobStatus =
  Database["public"]["Enums"]["resource_chunking_job_status"];

export type DbResourceChunkingJobPriority =
  Database["public"]["Enums"]["resource_chunking_job_priority"];

export type DbResourceChunkingJobReason =
  Database["public"]["Enums"]["resource_chunking_job_reason"];

export type DbResourceChunkingJobPayload = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  extractionDocumentId: string;
  sourceContentHash: string;
  chunkingStrategyVersion: string;
  sanitisationStrategyVersion: string;
  termId: string | null;
  subjectId: string | null;
  structureUnitId: string | null;
  requestedAt: IsoDateTimeString;
}>;

export type DbResourceChunkingJobRecord = Readonly<{
  jobId: JobId;
  studentId: StudentId;
  resourceId: ResourceId;
  extractionDocumentId: string;
  jobName: "resource.chunking.chunk";
  reason: DbResourceChunkingJobReason;
  priority: DbResourceChunkingJobPriority;
  status: DbResourceChunkingJobStatus;
  attemptCount: number;
  payload: DbResourceChunkingJobPayload;
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

export type CreateResourceChunkingJobInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  extractionDocumentId: string;
  jobName: "resource.chunking.chunk";
  reason: DbResourceChunkingJobReason;
  priority: DbResourceChunkingJobPriority;
  payload: DbResourceChunkingJobPayload;
}>;

export type GetResourceChunkingJobByIdInput = Readonly<{
  studentId: StudentId;
  jobId: JobId;
}>;

export type ResourceChunkingJobsRepository = Readonly<{
  enqueueResourceChunkingJob: (
    input: CreateResourceChunkingJobInput,
  ) => Promise<DbResourceChunkingJobRecord>;
  getResourceChunkingJobById: (
    input: GetResourceChunkingJobByIdInput,
  ) => Promise<DbResourceChunkingJobRecord | null>;
  claimQueuedResourceChunkingJobs: (
    input: ClaimQueuedResourceChunkingJobsInput,
  ) => Promise<readonly ClaimedDbResourceChunkingJobRecord[]>;
  recordResourceChunkingJobHeartbeat: (
    input: RecordResourceChunkingJobHeartbeatInput,
  ) => Promise<ClaimedDbResourceChunkingJobRecord>;
  releaseResourceChunkingJob: (
    input: ReleaseResourceChunkingJobInput,
  ) => Promise<DbResourceChunkingJobRecord>;
  completeResourceChunkingJob: (
    input: CompleteResourceChunkingJobInput,
  ) => Promise<DbResourceChunkingJobRecord>;
  failResourceChunkingJob: (
    input: FailResourceChunkingJobInput,
  ) => Promise<DbResourceChunkingJobRecord>;
}>;

export type CreateResourceChunkingJobsRepositoryInput = Readonly<{
  client: SupabaseClient<Database>;
}>;

export type ResourceChunkingJobsRepositoryErrorCode =
  | "resource_chunking_jobs_invalid_payload"
  | "resource_chunking_jobs_invalid_claim"
  | "resource_chunking_jobs_insert_failed"
  | "resource_chunking_jobs_read_failed"
  | "resource_chunking_jobs_claim_failed"
  | "resource_chunking_jobs_completion_failed"
  | "resource_chunking_jobs_heartbeat_failed"
  | "resource_chunking_jobs_release_failed"
  | "resource_chunking_jobs_failure_record_failed";

export class ResourceChunkingJobsRepositoryError extends Error {
  public readonly code: ResourceChunkingJobsRepositoryErrorCode;

  public constructor(code: ResourceChunkingJobsRepositoryErrorCode, message: string) {
    super(message);
    this.name = "ResourceChunkingJobsRepositoryError";
    this.code = code;
  }
}

const resourceChunkingJobSelectColumns =
  "job_id,student_id,resource_id,extraction_document_id,job_name,reason,priority,status,attempt_count,payload,locked_at,locked_by,heartbeat_at,available_at,enqueued_at,started_at,completed_at,failed_at,last_error,created_at,updated_at" as const;

export function createResourceChunkingJobsRepository(
  input: CreateResourceChunkingJobsRepositoryInput,
): ResourceChunkingJobsRepository {
  return {
    enqueueResourceChunkingJob: async (
      job: CreateResourceChunkingJobInput,
    ): Promise<DbResourceChunkingJobRecord> => {
      assertValidPayload(job.payload);

      const { data, error } = await input.client
        .from("resource_chunking_jobs")
        .insert({
          student_id: job.studentId,
          resource_id: job.resourceId,
          extraction_document_id: job.extractionDocumentId,
          job_name: job.jobName,
          reason: job.reason,
          priority: job.priority,
          status: "queued",
          attempt_count: 0,
          payload: job.payload as unknown as Json,
        })
        .select(resourceChunkingJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceChunkingJobsRepositoryError(
          "resource_chunking_jobs_insert_failed",
          error.message,
        );
      }

      return mapResourceChunkingJobRow(data);
    },

    getResourceChunkingJobById: async (
      lookup: GetResourceChunkingJobByIdInput,
    ): Promise<DbResourceChunkingJobRecord | null> => {
      const { data, error } = await input.client
        .from("resource_chunking_jobs")
        .select(resourceChunkingJobSelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("job_id", lookup.jobId)
        .maybeSingle();

      if (error !== null) {
        throw new ResourceChunkingJobsRepositoryError(
          "resource_chunking_jobs_read_failed",
          error.message,
        );
      }

      if (data === null) {
        return null;
      }

      return mapResourceChunkingJobRow(data);
    },

    claimQueuedResourceChunkingJobs: async (
      claim: ClaimQueuedResourceChunkingJobsInput,
    ): Promise<readonly ClaimedDbResourceChunkingJobRecord[]> => {
      assertValidClaimInput(claim);

      const staleClaimCutoff = new Date(
        Date.now() - claim.staleClaimThresholdSeconds * 1000,
      ).toISOString();

      const { data: candidates, error: readError } = await input.client
        .from("resource_chunking_jobs")
        .select(resourceChunkingJobSelectColumns)
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
        throw new ResourceChunkingJobsRepositoryError(
          "resource_chunking_jobs_claim_failed",
          readError.message,
        );
      }

      const claimedJobs: ClaimedDbResourceChunkingJobRecord[] = [];

      for (const candidate of candidates) {
        const { data: claimed, error: updateError } = await input.client
          .from("resource_chunking_jobs")
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
          .select(resourceChunkingJobSelectColumns)
          .maybeSingle();

        if (updateError !== null) {
          throw new ResourceChunkingJobsRepositoryError(
            "resource_chunking_jobs_claim_failed",
            updateError.message,
          );
        }

        if (claimed !== null) {
          claimedJobs.push(mapClaimedResourceChunkingJobRow(claimed));
        }
      }

      return claimedJobs;
    },

    recordResourceChunkingJobHeartbeat: async (
      heartbeat: RecordResourceChunkingJobHeartbeatInput,
    ): Promise<ClaimedDbResourceChunkingJobRecord> => {
      const { data, error } = await input.client
        .from("resource_chunking_jobs")
        .update({
          heartbeat_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("job_id", heartbeat.jobId)
        .eq("locked_by", heartbeat.workerId)
        .eq("status", "claimed")
        .select(resourceChunkingJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceChunkingJobsRepositoryError(
          "resource_chunking_jobs_heartbeat_failed",
          error.message,
        );
      }

      return mapClaimedResourceChunkingJobRow(data);
    },

    releaseResourceChunkingJob: async (
      release: ReleaseResourceChunkingJobInput,
    ): Promise<DbResourceChunkingJobRecord> => {
      const { data, error } = await input.client
        .from("resource_chunking_jobs")
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
        .select(resourceChunkingJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceChunkingJobsRepositoryError(
          "resource_chunking_jobs_release_failed",
          error.message,
        );
      }

      return mapResourceChunkingJobRow(data);
    },

    failResourceChunkingJob: async (
      failure: FailResourceChunkingJobInput,
    ): Promise<DbResourceChunkingJobRecord> => {
      const { data, error } = await input.client
        .from("resource_chunking_jobs")
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
        .select(resourceChunkingJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceChunkingJobsRepositoryError(
          "resource_chunking_jobs_failure_record_failed",
          error.message,
        );
      }

      return mapResourceChunkingJobRow(data);
    },

    completeResourceChunkingJob: async (
      completion: CompleteResourceChunkingJobInput,
    ): Promise<DbResourceChunkingJobRecord> => {
      const { data, error } = await input.client
        .from("resource_chunking_jobs")
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
        .select(resourceChunkingJobSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceChunkingJobsRepositoryError(
          "resource_chunking_jobs_completion_failed",
          error.message,
        );
      }

      return mapResourceChunkingJobRow(data);
    },
  };
}

function assertValidClaimInput(input: ClaimQueuedResourceChunkingJobsInput): void {
  if (input.workerId.length === 0) {
    throw new ResourceChunkingJobsRepositoryError(
      "resource_chunking_jobs_invalid_claim",
      "Resource chunking job claim requires a worker identifier.",
    );
  }

  if (!Number.isSafeInteger(input.limit) || input.limit <= 0) {
    throw new ResourceChunkingJobsRepositoryError(
      "resource_chunking_jobs_invalid_claim",
      "Resource chunking job claim requires a positive limit.",
    );
  }

  if (
    !Number.isSafeInteger(input.staleClaimThresholdSeconds)
    || input.staleClaimThresholdSeconds <= 0
  ) {
    throw new ResourceChunkingJobsRepositoryError(
      "resource_chunking_jobs_invalid_claim",
      "Resource chunking job claim requires a positive stale-claim threshold.",
    );
  }
}

function assertValidPayload(payload: DbResourceChunkingJobPayload): void {
  if (payload.extractionDocumentId.length === 0) {
    throw new ResourceChunkingJobsRepositoryError(
      "resource_chunking_jobs_invalid_payload",
      "Resource chunking job payload requires an extraction document id.",
    );
  }

  if (payload.sourceContentHash.length === 0) {
    throw new ResourceChunkingJobsRepositoryError(
      "resource_chunking_jobs_invalid_payload",
      "Resource chunking job payload requires a source content hash.",
    );
  }

  if (payload.chunkingStrategyVersion.length === 0) {
    throw new ResourceChunkingJobsRepositoryError(
      "resource_chunking_jobs_invalid_payload",
      "Resource chunking job payload requires a chunking strategy version.",
    );
  }

  if (payload.sanitisationStrategyVersion.length === 0) {
    throw new ResourceChunkingJobsRepositoryError(
      "resource_chunking_jobs_invalid_payload",
      "Resource chunking job payload requires a sanitisation strategy version.",
    );
  }

  if (payload.requestedAt.length === 0) {
    throw new ResourceChunkingJobsRepositoryError(
      "resource_chunking_jobs_invalid_payload",
      "Resource chunking job payload requires a requested-at timestamp.",
    );
  }
}

function mapClaimedResourceChunkingJobRow(
  row: Database["public"]["Tables"]["resource_chunking_jobs"]["Row"],
): ClaimedDbResourceChunkingJobRecord {
  const mapped = mapResourceChunkingJobRow(row);

  if (mapped.status !== "claimed" || mapped.lockedAt === null || mapped.lockedBy === null) {
    throw new ResourceChunkingJobsRepositoryError(
      "resource_chunking_jobs_claim_failed",
      "Resource chunking job row is not in a claimed state.",
    );
  }

  return {
    ...mapped,
    status: "claimed",
    lockedAt: mapped.lockedAt,
    lockedBy: mapped.lockedBy,
  };
}

function mapResourceChunkingJobRow(
  row: Database["public"]["Tables"]["resource_chunking_jobs"]["Row"],
): DbResourceChunkingJobRecord {
  return {
    jobId: row.job_id as JobId,
    studentId: row.student_id as StudentId,
    resourceId: row.resource_id as ResourceId,
    extractionDocumentId: row.extraction_document_id,
    jobName: row.job_name as "resource.chunking.chunk",
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

function mapPayload(payload: Json): DbResourceChunkingJobPayload {
  if (!isJsonObject(payload)) {
    throwInvalidPayloadShape();
  }

  assertValidRequiredPayloadFields(payload);
  assertValidOptionalPayloadFields(payload);

  return {
    studentId: payload["studentId"] as StudentId,
    resourceId: payload["resourceId"] as ResourceId,
    extractionDocumentId: payload["extractionDocumentId"] as string,
    sourceContentHash: payload["sourceContentHash"] as string,
    chunkingStrategyVersion: payload["chunkingStrategyVersion"] as string,
    sanitisationStrategyVersion: payload["sanitisationStrategyVersion"] as string,
    termId: payload["termId"] as string | null,
    subjectId: payload["subjectId"] as string | null,
    structureUnitId: payload["structureUnitId"] as string | null,
    requestedAt: payload["requestedAt"] as IsoDateTimeString,
  };
}

function assertValidRequiredPayloadFields(payload: Record<string, Json>): void {
  if (
    typeof payload["studentId"] !== "string"
    || typeof payload["resourceId"] !== "string"
    || typeof payload["extractionDocumentId"] !== "string"
    || typeof payload["sourceContentHash"] !== "string"
    || typeof payload["chunkingStrategyVersion"] !== "string"
    || typeof payload["sanitisationStrategyVersion"] !== "string"
    || typeof payload["requestedAt"] !== "string"
  ) {
    throwInvalidPayloadShape();
  }
}

function assertValidOptionalPayloadFields(payload: Record<string, Json>): void {
  const termId = payload["termId"];
  const subjectId = payload["subjectId"];
  const structureUnitId = payload["structureUnitId"];

  if (
    (termId !== null && typeof termId !== "string")
    || (subjectId !== null && typeof subjectId !== "string")
    || (structureUnitId !== null && typeof structureUnitId !== "string")
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
  throw new ResourceChunkingJobsRepositoryError(
    "resource_chunking_jobs_invalid_payload",
    "Resource chunking job payload has an unsupported shape.",
  );
}
