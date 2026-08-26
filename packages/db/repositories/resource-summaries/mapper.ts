// provenance is always "ai" for this table (NN-07); rendered at
// presentation via AIGeneratedBadge — see
// packages/ui-web/domain-components/ResourceSummaryCard.contract.ts.
import type { ChunkId, ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type { Database, Json } from "../../generated/database.types.js";
import { ResourceSummariesRepositoryError } from "./errors.js";
import type {
  DbResourceSummaryBody,
  DbResourceSummaryCitation,
  DbResourceSummaryHeading,
  DbResourceSummaryRecord,
} from "./contracts.js";

export function mapResourceSummaryRow(
  row: Database["public"]["Tables"]["resource_summaries"]["Row"],
  citationRows: readonly Database["public"]["Tables"]["resource_summary_citations"]["Row"][],
): DbResourceSummaryRecord {
  if (row.provenance !== "ai") {
    throwInvalidRecord("Resource summary provenance must be ai.");
  }

  return {
    resourceSummaryId: row.resource_summary_id,
    studentId: row.student_id as StudentId,
    resourceId: row.resource_id as ResourceId,
    promptVersion: row.prompt_version,
    summaryStrategyVersion: row.summary_strategy_version,
    modelVersion: row.model_version,
    body: mapBody(row.body),
    provenance: "ai",
    citations: citationRows.map(mapCitationRow),
    createdAt: row.created_at as IsoDateTimeString,
  };
}

function mapCitationRow(
  row: Database["public"]["Tables"]["resource_summary_citations"]["Row"],
): DbResourceSummaryCitation {
  return {
    chunkId: row.chunk_id as ChunkId,
    quote: row.quote,
  };
}

function mapBody(value: Json): DbResourceSummaryBody {
  if (!isJsonObject(value)) {
    throwInvalidRecord("Resource summary body must be an object.");
  }

  const headings = value["headings"];

  if (!Array.isArray(headings)) {
    throwInvalidRecord("Resource summary body headings must be an array.");
  }

  return {
    headings: headings.map(mapHeading),
  };
}

function mapHeading(value: Json): DbResourceSummaryHeading {
  if (!isJsonObject(value)) {
    throwInvalidRecord("Resource summary heading must be an object.");
  }

  const title = value["title"];
  const points = value["points"];

  if (typeof title !== "string") {
    throwInvalidRecord("Resource summary heading title must be a string.");
  }

  if (!Array.isArray(points) || points.some((point) => typeof point !== "string")) {
    throwInvalidRecord("Resource summary heading points must be an array of strings.");
  }

  return {
    title,
    points: points as string[],
  };
}

function isJsonObject(value: Json): value is { [key: string]: Json | undefined } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function throwInvalidRecord(message: string): never {
  throw new ResourceSummariesRepositoryError(
    "resource_summaries_repository_read_failed",
    message,
  );
}
