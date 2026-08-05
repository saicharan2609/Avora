export const resourceKinds = [
  "document",
  "image",
  "scan",
  "audio",
  "video",
  "archive",
  "other",
] as const;

export type ResourceKind = (typeof resourceKinds)[number];