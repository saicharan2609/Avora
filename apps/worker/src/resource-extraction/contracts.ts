import type { ResourceId, StudentId } from "@avora/core/identity";
import type {
  ResourceExtractionFailure,
} from "@avora/domain/resources";
import type {
  ResourceExtractionJobName,
  ResourceExtractionJobRequest,
} from "@avora/jobs/resource-extraction";

export const resourceExtractionWorkerHandlerName =
  "resource-extraction-worker-handler" as const;

export type ResourceExtractionWorkerHandlerName =
  typeof resourceExtractionWorkerHandlerName;

export type ResourceExtractionWorkerHandledOutcome =
  | "extracted"
  | "partially_extracted"
  | "failed";

export type ResourceExtractionWorkerHandledResult = Readonly<{
  handlerName: ResourceExtractionWorkerHandlerName;
  jobName: ResourceExtractionJobName;
  studentId: StudentId;
  resourceId: ResourceId;
  outcome: ResourceExtractionWorkerHandledOutcome;
  extractionDocumentId: string | null;
  persistedBlockCount: number;
  failure: ResourceExtractionFailure | null;
}>;

export type HandleResourceExtractionJobInput = Readonly<{
  job: ResourceExtractionJobRequest;
}>;