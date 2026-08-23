import type { JobId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type { DbResourceIndexingJobRecord } from "./repository.js";

export type ClaimQueuedResourceIndexingJobsInput = Readonly<{
  workerId: string;
  limit: number;
  staleClaimThresholdSeconds: number;
}>;

export type RecordResourceIndexingJobHeartbeatInput = Readonly<{
  jobId: JobId;
  workerId: string;
}>;

export type ReleaseResourceIndexingJobInput = Readonly<{
  jobId: JobId;
  workerId: string;
  availableAt: IsoDateTimeString;
}>;

export type CompleteResourceIndexingJobInput = Readonly<{
  jobId: JobId;
  workerId: string;
}>;

export type FailResourceIndexingJobInput = Readonly<{
  jobId: JobId;
  workerId: string;
  errorMessage: string;
}>;

export type ClaimedDbResourceIndexingJobRecord = DbResourceIndexingJobRecord & Readonly<{
  status: "claimed";
  lockedAt: IsoDateTimeString;
  lockedBy: string;
}>;
