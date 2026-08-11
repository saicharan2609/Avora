import type { ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type { Database, Json } from "../../generated/database.types.js";
import {
  RetrievalChunkRepositoryError,
} from "./errors.js";
import type {
  DbRetrievalChunkBoundingBox,
  DbRetrievalChunkId,
  DbRetrievalChunkLocator,
  DbRetrievalChunkLocatorKind,
  DbRetrievalChunkRecord,
  DbRetrievalChunkTextSpan,
  DbRetrievalChunkTimeRange,
  DbRetrievalChunkingStrategyVersion,
  DbRetrievalExtractedContentBlockId,
  DbRetrievalExtractionDocumentId,
  DbRetrievalSanitisationStrategyVersion,
} from "./contracts.js";

export function mapRetrievalChunkRow(
  row: Database["public"]["Tables"]["chunks"]["Row"],
): DbRetrievalChunkRecord {
  return {
    chunkId: row.chunk_id as DbRetrievalChunkId,
    studentId: row.student_id as StudentId,
    resourceId: row.resource_id as ResourceId,
    extractionDocumentId:
      row.extraction_document_id as DbRetrievalExtractionDocumentId,
    sourceBlockIds:
      row.source_block_ids as DbRetrievalExtractedContentBlockId[],
    scope: {
      termId: row.term_id,
      subjectId: row.subject_id,
      structureUnitId: row.structure_unit_id,
      resourceId: row.resource_id as ResourceId,
    },
    contentKind: row.content_kind,
    text: row.text,
    tokenEstimate: row.token_estimate,
    sanitisation: {
      status: row.sanitisation_status,
      strategyVersion:
        row.sanitisation_strategy_version as DbRetrievalSanitisationStrategyVersion,
      warnings: mapWarnings(row.sanitisation_warnings),
    },
    locator: mapLocator(row.locator),
    sourceContentHash: row.source_content_hash,
    chunkingStrategyVersion:
      row.chunking_strategy_version as DbRetrievalChunkingStrategyVersion,
    status: row.status,
    sortOrder: row.sort_order,
    createdAt: row.created_at as IsoDateTimeString,
    updatedAt: row.updated_at as IsoDateTimeString,
  };
}

export function mapLocator(locator: Json): DbRetrievalChunkLocator {
  if (!isJsonObject(locator)) {
    throwInvalidLocator();
  }

  const kind = locator["kind"];
  const pageNumber = locator["pageNumber"];
  const slideNumber = locator["slideNumber"];
  const boundingBox = locator["boundingBox"];
  const textSpan = locator["textSpan"];
  const timeRange = locator["timeRange"];
  const label = locator["label"];

  if (!isLocatorKind(kind)) {
    throwInvalidLocator();
  }

  return {
    kind,
    pageNumber: readNullableNumber(pageNumber),
    slideNumber: readNullableNumber(slideNumber),
    boundingBox: readNullableBoundingBox(boundingBox),
    textSpan: readNullableTextSpan(textSpan),
    timeRange: readNullableTimeRange(timeRange),
    label: readNullableString(label),
  };
}

function mapWarnings(value: Json): readonly string[] {
  if (!Array.isArray(value)) {
    throw new RetrievalChunkRepositoryError(
      "retrieval_chunk_repository_invalid_chunk",
      "Retrieval chunk sanitisation warnings must be an array.",
    );
  }

  return value.map((warning) => {
    if (typeof warning !== "string") {
      throw new RetrievalChunkRepositoryError(
        "retrieval_chunk_repository_invalid_chunk",
        "Retrieval chunk sanitisation warnings must contain strings only.",
      );
    }

    return warning;
  });
}

function isJsonObject(value: Json): value is { [key: string]: Json | undefined } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLocatorKind(value: Json | undefined): value is DbRetrievalChunkLocatorKind {
  return (
    value === "document_page"
    || value === "slide"
    || value === "image_region"
    || value === "audio_time_range"
    || value === "video_time_range"
    || value === "text_span"
    || value === "unknown"
  );
}

function readNullableString(value: Json | undefined): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throwInvalidLocator();
  }

  return value;
}

function readNullableNumber(value: Json | undefined): number | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throwInvalidLocator();
  }

  return value;
}

function readNullableBoundingBox(
  value: Json | undefined,
): DbRetrievalChunkBoundingBox | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (!isJsonObject(value)) {
    throwInvalidLocator();
  }

  const x = value["x"];
  const y = value["y"];
  const width = value["width"];
  const height = value["height"];
  const unit = value["unit"];

  if (
    typeof x !== "number"
    || typeof y !== "number"
    || typeof width !== "number"
    || typeof height !== "number"
    || !isBoundingBoxUnit(unit)
  ) {
    throwInvalidLocator();
  }

  return {
    x,
    y,
    width,
    height,
    unit,
  };
}

function readNullableTextSpan(
  value: Json | undefined,
): DbRetrievalChunkTextSpan | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (!isJsonObject(value)) {
    throwInvalidLocator();
  }

  const startOffset = value["startOffset"];
  const endOffset = value["endOffset"];

  if (
    typeof startOffset !== "number"
    || typeof endOffset !== "number"
  ) {
    throwInvalidLocator();
  }

  return {
    startOffset,
    endOffset,
  };
}

function readNullableTimeRange(
  value: Json | undefined,
): DbRetrievalChunkTimeRange | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (!isJsonObject(value)) {
    throwInvalidLocator();
  }

  const startSeconds = value["startSeconds"];
  const endSeconds = value["endSeconds"];

  if (
    typeof startSeconds !== "number"
    || typeof endSeconds !== "number"
  ) {
    throwInvalidLocator();
  }

  return {
    startSeconds,
    endSeconds,
  };
}

function isBoundingBoxUnit(
  value: Json | undefined,
): value is DbRetrievalChunkBoundingBox["unit"] {
  return value === "ratio" || value === "point" || value === "pixel";
}

function throwInvalidLocator(): never {
  throw new RetrievalChunkRepositoryError(
    "retrieval_chunk_repository_invalid_locator",
    "Retrieval chunk locator has an unsupported shape.",
  );
}