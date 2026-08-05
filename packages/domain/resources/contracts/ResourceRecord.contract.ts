import type { ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type { ResourceKind } from "./ResourceKind.contract.js";
import type { ResourceLifecycleState } from "./ResourceLifecycleState.contract.js";
import type { ResourceStorageLocation } from "./ResourceStorage.contract.js";

export type ResourceRecord = Readonly<{
  resourceId: ResourceId;
  studentId: StudentId;
  kind: ResourceKind;
  originalFilename: string;
  declaredMimeType: string;
  byteSize: number;
  contentHash: string | null;
  lifecycleState: ResourceLifecycleState;
  storage: ResourceStorageLocation;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}>;