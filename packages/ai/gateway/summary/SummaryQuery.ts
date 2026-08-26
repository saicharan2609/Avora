import type {
  ResourceId,
  StudentId,
} from "@avora/core/identity";
import type {
  IsoDateTimeString,
} from "@avora/core/time";

export type SummaryQuery = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  promptVersion: string;
  summaryStrategyVersion: string;
  requestedAt: IsoDateTimeString;
}>;
