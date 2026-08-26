import type { ResourceId, StudentId } from "@avora/core/identity";

import type { ResourceSummary } from "../contracts/ResourceSummary.contract.js";

export type SaveResourceSummaryInput = ResourceSummary;

export type GetLatestResourceSummaryInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
}>;

export type ResourceSummaryRepositoryPort = Readonly<{
  saveResourceSummary: (input: SaveResourceSummaryInput) => Promise<ResourceSummary>;
  getLatestResourceSummary: (
    input: GetLatestResourceSummaryInput,
  ) => Promise<ResourceSummary | null>;
}>;
