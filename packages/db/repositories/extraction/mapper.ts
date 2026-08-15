import type { ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type { Database, Json } from "../../generated/database.types.js";
import {
  ResourceExtractionRepositoryError,
} from "./errors.js";
import type {
  DbExtractionProvenanceSource,
  DbResourceBoundingBox,
  DbResourceExtractedContentBlockId,
  DbResourceExtractedContentBlockNode,
  DbResourceExtractedContentBlockRecord,
  DbResourceExtractedPageId,
  DbResourceExtractedPageRecord,
  DbResourceExtractionDocumentId,
  DbResourceExtractionDocumentRecord,
  DbResourceExtractionDocumentTree,
  DbResourceExtractionFailureId,
  DbResourceExtractionFailureRecord,
  DbResourceExtractionProvenanceId,
  DbResourceExtractionProvenanceRecord,
  DbResourceSourceLocator,
  DbResourceSourceLocatorKind,
  DbResourceTextSpan,
  DbResourceTimeRange,
} from "./contracts.js";

export function mapResourceExtractionDocumentRow(
  row: Database["public"]["Tables"]["resource_extraction_documents"]["Row"],
): DbResourceExtractionDocumentRecord {
  return {
    extractionDocumentId: row.extraction_document_id as DbResourceExtractionDocumentId,
    studentId: row.student_id as StudentId,
    resourceId: row.resource_id as ResourceId,
    status: row.status,
    extractionStrategyVersion: row.extraction_strategy_version as DbResourceExtractionDocumentRecord["extractionStrategyVersion"],
    chunkingStrategyVersion: row.chunking_strategy_version as DbResourceExtractionDocumentRecord["chunkingStrategyVersion"],
    extractedAt: row.extracted_at as IsoDateTimeString,
    createdAt: row.created_at as IsoDateTimeString,
    updatedAt: row.updated_at as IsoDateTimeString,
  };
}

export function mapResourceExtractedContentBlockRow(
  row: Database["public"]["Tables"]["resource_extracted_content_blocks"]["Row"],
): DbResourceExtractedContentBlockRecord {
  return {
    blockId: row.block_id as DbResourceExtractedContentBlockId,
    extractionDocumentId: row.extraction_document_id as DbResourceExtractionDocumentId,
    studentId: row.student_id as StudentId,
    resourceId: row.resource_id as ResourceId,
    kind: row.kind,
    text: row.text,
    locator: mapLocator(row.locator),
    sortOrder: row.sort_order,
    parentBlockId: row.parent_block_id as DbResourceExtractedContentBlockId | null,
    confidence: row.confidence,
    createdAt: row.created_at as IsoDateTimeString,
    updatedAt: row.updated_at as IsoDateTimeString,
  };
}

export function mapResourceExtractionProvenanceRow(
  row: Database["public"]["Tables"]["resource_extraction_provenance"]["Row"],
): DbResourceExtractionProvenanceRecord {
  return {
    provenanceId: row.provenance_id as DbResourceExtractionProvenanceId,
    extractionDocumentId: row.extraction_document_id as DbResourceExtractionDocumentId,
    studentId: row.student_id as StudentId,
    resourceId: row.resource_id as ResourceId,
    pageNumber: row.page_number,
    source: row.source as DbExtractionProvenanceSource,
    strategyVersion: row.strategy_version as DbResourceExtractionProvenanceRecord["strategyVersion"],
    extractedAt: row.extracted_at as IsoDateTimeString,
    notes: row.notes,
    createdAt: row.created_at as IsoDateTimeString,
  };
}

export function mapResourceExtractedPageRow(
  row: Database["public"]["Tables"]["resource_extracted_pages"]["Row"],
): DbResourceExtractedPageRecord {
  return {
    pageId: row.page_id as DbResourceExtractedPageId,
    extractionDocumentId: row.extraction_document_id as DbResourceExtractionDocumentId,
    studentId: row.student_id as StudentId,
    resourceId: row.resource_id as ResourceId,
    provenanceId: row.provenance_id as DbResourceExtractionProvenanceId,
    pageNumber: row.page_number,
    text: row.text,
    locator: mapLocator(row.locator),
    confidence: row.confidence,
    createdAt: row.created_at as IsoDateTimeString,
    updatedAt: row.updated_at as IsoDateTimeString,
  };
}

export function mapResourceExtractionFailureRow(
  row: Database["public"]["Tables"]["resource_extraction_failures"]["Row"],
): DbResourceExtractionFailureRecord {
  return {
    failureId: row.failure_id as DbResourceExtractionFailureId,
    extractionDocumentId: row.extraction_document_id as DbResourceExtractionDocumentId,
    studentId: row.student_id as StudentId,
    resourceId: row.resource_id as ResourceId,
    provenanceId:
      row.provenance_id === null
        ? null
        : row.provenance_id as DbResourceExtractionProvenanceId,
    code: row.code as DbResourceExtractionFailureRecord["code"],
    pageNumber: row.page_number,
    message: row.message,
    createdAt: row.created_at as IsoDateTimeString,
  };
}

export function mapLocator(locator: Json): DbResourceSourceLocator {
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

export function buildResourceExtractedContentBlockTree(input: Readonly<{
  document: DbResourceExtractionDocumentRecord;
  blocks: readonly DbResourceExtractedContentBlockRecord[];
}>): DbResourceExtractionDocumentTree {
  const nodesById = new Map<DbResourceExtractedContentBlockId, MutableBlockNode>();
  const roots: MutableBlockNode[] = [];

  for (const block of input.blocks) {
    nodesById.set(block.blockId, {
      block,
      children: [],
    });
  }

  for (const block of input.blocks) {
    const node = nodesById.get(block.blockId);

    if (node === undefined) {
      throw new ResourceExtractionRepositoryError(
        "resource_extraction_repository_invalid_tree",
        "Extracted content tree builder could not find a created node.",
      );
    }

    if (block.parentBlockId === null) {
      roots.push(node);
      continue;
    }

    const parent = nodesById.get(block.parentBlockId);

    if (parent === undefined) {
      throw new ResourceExtractionRepositoryError(
        "resource_extraction_repository_invalid_tree",
        "Extracted content tree contains a missing parent block reference.",
      );
    }

    parent.children.push(node);
  }

  sortNodes(roots);

  return {
    document: input.document,
    blocks: freezeNodes(roots),
  };
}

type MutableBlockNode = {
  block: DbResourceExtractedContentBlockRecord;
  children: MutableBlockNode[];
};

function sortNodes(nodes: MutableBlockNode[]): void {
  nodes.sort(compareBlockNodes);

  for (const node of nodes) {
    sortNodes(node.children);
  }
}

function freezeNodes(
  nodes: readonly MutableBlockNode[],
): readonly DbResourceExtractedContentBlockNode[] {
  return nodes.map((node): DbResourceExtractedContentBlockNode => ({
    block: node.block,
    children: freezeNodes(node.children),
  }));
}

function compareBlockNodes(left: MutableBlockNode, right: MutableBlockNode): number {
  if (left.block.sortOrder !== right.block.sortOrder) {
    return left.block.sortOrder - right.block.sortOrder;
  }

  return left.block.blockId.localeCompare(right.block.blockId);
}

function isJsonObject(value: Json): value is { [key: string]: Json | undefined } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLocatorKind(value: Json | undefined): value is DbResourceSourceLocatorKind {
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

function readNullableBoundingBox(value: Json | undefined): DbResourceBoundingBox | null {
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

function readNullableTextSpan(value: Json | undefined): DbResourceTextSpan | null {
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

function readNullableTimeRange(value: Json | undefined): DbResourceTimeRange | null {
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

function isBoundingBoxUnit(value: Json | undefined): value is DbResourceBoundingBox["unit"] {
  return value === "ratio" || value === "point" || value === "pixel";
}

function throwInvalidLocator(): never {
  throw new ResourceExtractionRepositoryError(
    "resource_extraction_repository_invalid_locator",
    "Resource extraction locator has an unsupported shape.",
  );
}