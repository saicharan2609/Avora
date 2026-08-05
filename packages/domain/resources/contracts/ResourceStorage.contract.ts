export const resourceStorageBuckets = [
  "quarantine",
  "originals",
  "derivatives",
  "exports",
  "shared",
] as const;

export type ResourceStorageBucket = (typeof resourceStorageBuckets)[number];

export type ResourceStorageVersion = number;

export type ResourceStorageLocation = Readonly<{
  bucket: ResourceStorageBucket;
  objectPath: string;
  version: ResourceStorageVersion;
}>;