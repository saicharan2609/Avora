import type { ResourceStorageLocation } from "../contracts/index.js";

export type InspectResourceObjectInput = Readonly<{
  storage: ResourceStorageLocation;
}>;

export type InspectResourceObjectResult =
  | Readonly<{
      exists: true;
      byteSize: number;
      contentType: string;
    }>
  | Readonly<{
      exists: false;
    }>;

export type ResourceObjectInspectionPort = Readonly<{
  inspectResourceObject: (
    input: InspectResourceObjectInput,
  ) => Promise<InspectResourceObjectResult>;
}>;