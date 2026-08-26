import type {
  ChunkId,
  ResourceId,
  StudentId,
} from "@avora/core/identity";
import type {
  IsoDateTimeString,
} from "@avora/core/time";
import type {
  Provenance,
} from "@avora/core/domain-types";

export type ResourceSummaryHeading = Readonly<{
  title: string;
  points: readonly string[];
}>;

export type ResourceSummaryBody = Readonly<{
  headings: readonly ResourceSummaryHeading[];
}>;

export type ResourceSummaryCitation = Readonly<{
  chunkId: ChunkId;
  quote: string;
}>;

export type ResourceSummary = Readonly<{
  resourceId: ResourceId;
  studentId: StudentId;
  promptVersion: string;
  summaryStrategyVersion: string;
  // ENG-235: every AI output is stamped with provenance, model version, and
  // prompt version at persistence. The concrete provider model that
  // produced this summary (e.g. "gemini-3.6-flash").
  modelVersion: string;
  body: ResourceSummaryBody;
  citations: readonly ResourceSummaryCitation[];
  provenance: Extract<Provenance, "ai">;
  createdAt: IsoDateTimeString;
}>;
