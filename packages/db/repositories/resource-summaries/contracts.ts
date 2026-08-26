// provenance is always "ai" for this table (NN-07); rendered at
// presentation via AIGeneratedBadge — see
// packages/ui-web/domain-components/ResourceSummaryCard.contract.ts.
import type { ChunkId, ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

export type DbResourceSummaryHeading = Readonly<{
  title: string;
  points: readonly string[];
}>;

export type DbResourceSummaryBody = Readonly<{
  headings: readonly DbResourceSummaryHeading[];
}>;

export type DbResourceSummaryCitation = Readonly<{
  chunkId: ChunkId;
  quote: string;
}>;

export type DbResourceSummaryRecord = Readonly<{
  resourceSummaryId: string;
  studentId: StudentId;
  resourceId: ResourceId;
  promptVersion: string;
  summaryStrategyVersion: string;
  // ENG-235: every AI output is stamped with provenance, model version, and
  // prompt version at persistence. Concrete provider model that produced
  // this summary (e.g. "gemini-3.6-flash").
  modelVersion: string;
  body: DbResourceSummaryBody;
  provenance: "ai";
  citations: readonly DbResourceSummaryCitation[];
  createdAt: IsoDateTimeString;
}>;

export type SaveResourceSummaryInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  promptVersion: string;
  summaryStrategyVersion: string;
  modelVersion: string;
  body: DbResourceSummaryBody;
  citations: readonly DbResourceSummaryCitation[];
}>;

export type GetLatestResourceSummaryInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
}>;

export type ResourceSummariesRepository = Readonly<{
  saveResourceSummary: (
    input: SaveResourceSummaryInput,
  ) => Promise<DbResourceSummaryRecord>;
  getLatestResourceSummary: (
    input: GetLatestResourceSummaryInput,
  ) => Promise<DbResourceSummaryRecord | null>;
}>;
