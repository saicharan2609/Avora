import type { JobId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type { DbResourceClassificationJobRecord } from "./repository.js";

export type ClaimQueuedResourceClassificationJobsInput = Readonly<{
  workerId: string;
  limit: number;
  staleClaimThresholdSeconds: number;
}>;

export type RecordResourceClassificationJobHeartbeatInput = Readonly<{
  jobId: JobId;
  workerId: string;
}>;

export type ReleaseResourceClassificationJobInput = Readonly<{
  jobId: JobId;
  workerId: string;
  availableAt: IsoDateTimeString;
}>;

export type CompleteResourceClassificationJobInput = Readonly<{
  jobId: JobId;
  workerId: string;
}>;

export type FailResourceClassificationJobInput = Readonly<{
  jobId: JobId;
  workerId: string;
  errorMessage: string;
}>;

export type ClaimedDbResourceClassificationJobRecord =
  DbResourceClassificationJobRecord & Readonly<{
    status: "claimed";
    lockedAt: IsoDateTimeString;
    lockedBy: string;
  }>;
