import type { JobId, ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type {
  ResourceIngestionJobPayload,
  ResourceIngestionJobPriority,
  ResourceIngestionJobReason,
  ResourceIngestionJobStatus,
} from "../queue/index.js";

export type PersistResourceIngestionJobInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  jobName: "resources.ingestion.requested";
  reason: ResourceIngestionJobReason;
  priority: ResourceIngestionJobPriority;
  payload: ResourceIngestionJobPayload;
}>;

export type PersistResourceIngestionJobResult = Readonly<{
  jobId: JobId;
  status: ResourceIngestionJobStatus;
  enqueuedAt: IsoDateTimeString;
}>;

export type DurableResourceIngestionQueuePort = Readonly<{
  persistResourceIngestionJob: (
    input: PersistResourceIngestionJobInput,
  ) => Promise<PersistResourceIngestionJobResult>;
}>;