import type { JobId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type { DbResourceExtractionJobRecord } from "./repository.js";

export type ClaimQueuedResourceExtractionJobsInput = Readonly<{
  workerId: string;
  limit: number;
  staleClaimThresholdSeconds: number;
}>;

export type RecordResourceExtractionJobHeartbeatInput = Readonly<{
  jobId: JobId;
  workerId: string;
}>;

export type ReleaseResourceExtractionJobInput = Readonly<{
  jobId: JobId;
  workerId: string;
  availableAt: IsoDateTimeString;
}>;

export type CompleteResourceExtractionJobInput = Readonly<{
  jobId: JobId;
  workerId: string;
}>;

export type FailResourceExtractionJobInput = Readonly<{
  jobId: JobId;
  workerId: string;
  errorMessage: string;
}>;

export type ClaimedDbResourceExtractionJobRecord = DbResourceExtractionJobRecord & Readonly<{
  status: "claimed";
  lockedAt: IsoDateTimeString;
  lockedBy: string;
}>;
