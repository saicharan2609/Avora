import type { JobId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type { DbResourceSummaryJobRecord } from "./repository.js";

export type ClaimQueuedResourceSummaryJobsInput = Readonly<{
  workerId: string;
  limit: number;
  staleClaimThresholdSeconds: number;
}>;

export type RecordResourceSummaryJobHeartbeatInput = Readonly<{
  jobId: JobId;
  workerId: string;
}>;

export type ReleaseResourceSummaryJobInput = Readonly<{
  jobId: JobId;
  workerId: string;
  availableAt: IsoDateTimeString;
}>;

export type CompleteResourceSummaryJobInput = Readonly<{
  jobId: JobId;
  workerId: string;
}>;

export type FailResourceSummaryJobInput = Readonly<{
  jobId: JobId;
  workerId: string;
  errorMessage: string;
}>;

export type ClaimedDbResourceSummaryJobRecord =
  DbResourceSummaryJobRecord & Readonly<{
    status: "claimed";
    lockedAt: IsoDateTimeString;
    lockedBy: string;
  }>;
