export const resourceIngestionJobStatuses = [
  "queued",
  "claimed",
  "running",
  "succeeded",
  "failed",
  "dead_lettered",
  "cancelled",
] as const;

export type ResourceIngestionJobStatus = (typeof resourceIngestionJobStatuses)[number];