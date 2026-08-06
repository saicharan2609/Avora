import type {
  ResourceIngestionJobEnvelope,
  ResourceIngestionJobPayload,
  ResourceIngestionJobPriority,
  ResourceIngestionJobReason,
} from "../queue/index.js";

export type EnqueueResourceIngestionJobInput = Readonly<{
  reason: ResourceIngestionJobReason;
  priority: ResourceIngestionJobPriority;
  payload: ResourceIngestionJobPayload;
}>;

export type EnqueueResourceIngestionJobResult = Readonly<{
  envelope: ResourceIngestionJobEnvelope;
}>;

export type ResourceIngestionJobQueuePort = Readonly<{
  enqueueResourceIngestionJob: (
    input: EnqueueResourceIngestionJobInput,
  ) => Promise<EnqueueResourceIngestionJobResult>;
}>;