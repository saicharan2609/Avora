export const resourceLifecycleStates = [
  "pending_upload",
  "uploaded",
  "rejected",
  "processing",
  "ready",
  "failed",
  "deleted",
] as const;

export type ResourceLifecycleState = (typeof resourceLifecycleStates)[number];