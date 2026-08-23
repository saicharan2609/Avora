import type { JobId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type { DbResourceChunkingJobRecord } from "./repository.js";

export type ClaimQueuedResourceChunkingJobsInput = Readonly<{
  workerId: string;
  limit: number;
  staleClaimThresholdSeconds: number;
}>;

export type RecordResourceChunkingJobHeartbeatInput = Readonly<{
  jobId: JobId;
  workerId: string;
}>;

export type ReleaseResourceChunkingJobInput = Readonly<{
  jobId: JobId;
  workerId: string;
  availableAt: IsoDateTimeString;
}>;

export type CompleteResourceChunkingJobInput = Readonly<{
  jobId: JobId;
  workerId: string;
}>;

export type FailResourceChunkingJobInput = Readonly<{
  jobId: JobId;
  workerId: string;
  errorMessage: string;
}>;

export type ClaimedDbResourceChunkingJobRecord = DbResourceChunkingJobRecord & Readonly<{
  status: "claimed";
  lockedAt: IsoDateTimeString;
  lockedBy: string;
}>;
