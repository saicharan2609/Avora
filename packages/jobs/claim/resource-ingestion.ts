import type { JobId, ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type {
  ResourceIngestionJobPayload,
  ResourceIngestionJobPriority,
  ResourceIngestionJobReason,
} from "../queue/index.js";

export type ClaimedResourceIngestionJob = Readonly<{
  jobId: JobId;
  studentId: StudentId;
  resourceId: ResourceId;
  reason: ResourceIngestionJobReason;
  priority: ResourceIngestionJobPriority;
  payload: ResourceIngestionJobPayload;
  attemptCount: number;
  lockedAt: IsoDateTimeString;
  lockedBy: string;
  enqueuedAt: IsoDateTimeString;
}>;

export type ResourceIngestionClaimLoopOptions = Readonly<{
  limit: number;
  staleClaimThresholdSeconds: number;
}>;