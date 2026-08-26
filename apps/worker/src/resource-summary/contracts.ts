import type { ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";
import type {
  ResourceSummariesRepository,
} from "@avora/db/repositories/resource-summaries";
import type {
  SummaryGatewayPort,
} from "@avora/ai";

export type ResourceSummaryWorkerInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  promptVersion: string;
  summaryStrategyVersion: string;
  requestedAt: IsoDateTimeString;
}>;

export const resourceSummaryWorkerOutcomes = [
  "generated",
  "insufficient_evidence",
] as const;

export type ResourceSummaryWorkerOutcome =
  (typeof resourceSummaryWorkerOutcomes)[number];

export type ResourceSummaryWorkerResult = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  outcome: ResourceSummaryWorkerOutcome;
}>;

export type ResourceSummaryWorkerDependencies = Readonly<{
  summaryGateway: Pick<SummaryGatewayPort, "generateResourceSummary">;
  resourceSummariesRepository: Pick<
    ResourceSummariesRepository,
    "saveResourceSummary"
  >;
}>;
