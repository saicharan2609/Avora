import type { JobId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type { DbResourceIngestionJobRecord } from "./repository.js";

export type ClaimQueuedResourceIngestionJobsInput = Readonly<{
  workerId: string;
  limit: number;
  staleClaimThresholdSeconds: number;
}>;

export type RecordResourceIngestionJobHeartbeatInput = Readonly<{
  jobId: JobId;
  workerId: string;
}>;

export type ReleaseResourceIngestionJobInput = Readonly<{
  jobId: JobId;
  workerId: string;
  availableAt: IsoDateTimeString;
}>;

export type CompleteResourceIngestionJobInput = Readonly<{
  jobId: JobId;
  workerId: string;
}>;

export type FailResourceIngestionJobInput = Readonly<{
  jobId: JobId;
  workerId: string;
  errorMessage: string;
}>;

export type ClaimedDbResourceIngestionJobRecord = DbResourceIngestionJobRecord & Readonly<{
  status: "claimed";
  lockedAt: IsoDateTimeString;
  lockedBy: string;
}>;