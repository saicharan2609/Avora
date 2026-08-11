import { createHash } from "node:crypto";

import type {
  CreateRetrievalChunkInput,
} from "./contracts/index.js";
import {
  ResourceChunkerError,
} from "./ResourceChunker.errors.js";

type RetrievalChunkSource = CreateRetrievalChunkInput["source"];
type RetrievalChunkScope = CreateRetrievalChunkInput["scope"];
type RetrievalChunkContent = CreateRetrievalChunkInput["content"];
type RetrievalChunkContentKind = RetrievalChunkContent["kind"];
type RetrievalChunkLocator = CreateRetrievalChunkInput["locator"];
type RetrievalChunkId = CreateRetrievalChunkInput["chunkId"];
type RetrievalChunkingStrategyVersion =
  CreateRetrievalChunkInput["chunkingStrategyVersion"];
type RetrievalSanitisationStrategyVersion =
  RetrievalChunkContent["sanitisation"]["strategyVersion"];
type RetrievalExtractedContentBlockId =
  RetrievalChunkSource["sourceBlockIds"][number];

export type ChunkingStrategy = Readonly<{
  chunkingStrategyVersion: RetrievalChunkingStrategyVersion;
  sanitisationStrategyVersion: RetrievalSanitisationStrategyVersion;
  targetTokenEstimate: number;
  maximumTokenEstimate: number;
  overlapBlockCount: number;
}>;

export type ResourceChunkerExtractionDocument = Readonly<{
  studentId: RetrievalChunkSource["studentId"];
  resourceId: RetrievalChunkSource["resourceId"];
  extractionDocumentId: RetrievalChunkSource["extractionDocumentId"];
  status: string;
}>;

export type ResourceChunkerExtractedContentBlock = Readonly<{
  blockId: RetrievalExtractedContentBlockId;
  extractionDocumentId: RetrievalChunkSource["extractionDocumentId"];
  studentId: RetrievalChunkSource["studentId"];
  resourceId: RetrievalChunkSource["resourceId"];
  kind: Exclude<RetrievalChunkContentKind, "mixed">;
  text: string;
  locator: RetrievalChunkLocator;
  sortOrder: number;
  parentBlockId: string | null;
  confidence: number | null;
}>;

export type ResourceChunkerScope = Readonly<{
  termId: RetrievalChunkScope["termId"];
  subjectId: RetrievalChunkScope["subjectId"];
  structureUnitId: RetrievalChunkScope["structureUnitId"];
}>;

export type ResourceChunkerInput = Readonly<{
  document: ResourceChunkerExtractionDocument;
  blocks: readonly ResourceChunkerExtractedContentBlock[];
  sourceContentHash: RetrievalChunkSource["sourceContentHash"];
  scope: ResourceChunkerScope;
  strategy: ChunkingStrategy;
}>;

export type ResourceChunkerResult = Readonly<{
  studentId: RetrievalChunkSource["studentId"];
  resourceId: RetrievalChunkSource["resourceId"];
  extractionDocumentId: RetrievalChunkSource["extractionDocumentId"];
  sourceContentHash: RetrievalChunkSource["sourceContentHash"];
  chunkingStrategyVersion: RetrievalChunkingStrategyVersion;
  chunks: readonly CreateRetrievalChunkInput[];
}>;

export type ResourceChunker = Readonly<{
  chunkResource: (input: ResourceChunkerInput) => ResourceChunkerResult;
}>;

export type CreateResourceChunkerInput = Readonly<Record<string, never>>;

type PendingChunkBlock = Readonly<{
  blockId: RetrievalExtractedContentBlockId;
  kind: Exclude<RetrievalChunkContentKind, "mixed">;
  normalizedText: string;
  locator: RetrievalChunkLocator;
  sortOrder: number;
}>;

const specialContentKinds = new Set<RetrievalChunkContentKind>([
  "table",
  "formula",
  "code",
  "figure",
  "diagram",
]);

export function createResourceChunker(
  _input: CreateResourceChunkerInput = {},
): ResourceChunker {
  return {
    chunkResource: (input: ResourceChunkerInput): ResourceChunkerResult => {
      assertValidChunkerInput(input);

      const sortedBlocks = [...input.blocks].sort(compareBlocks);
      const chunks = buildChunks(input, sortedBlocks);

      if (chunks.length === 0) {
        throw new ResourceChunkerError(
          "resource_chunker_empty_output",
          "Resource chunker produced no chunks.",
        );
      }

      return {
        studentId: input.document.studentId,
        resourceId: input.document.resourceId,
        extractionDocumentId: input.document.extractionDocumentId,
        sourceContentHash: input.sourceContentHash,
        chunkingStrategyVersion: input.strategy.chunkingStrategyVersion,
        chunks,
      };
    },
  };
}

function assertValidChunkerInput(input: ResourceChunkerInput): void {
  if (input.sourceContentHash.trim().length === 0) {
    throw new ResourceChunkerError(
      "resource_chunker_invalid_input",
      "Resource chunker requires a non-empty source content hash.",
    );
  }

  if (String(input.strategy.chunkingStrategyVersion).trim().length === 0) {
    throw new ResourceChunkerError(
      "resource_chunker_invalid_input",
      "Resource chunker requires a non-empty chunking strategy version.",
    );
  }

  if (String(input.strategy.sanitisationStrategyVersion).trim().length === 0) {
    throw new ResourceChunkerError(
      "resource_chunker_invalid_input",
      "Resource chunker requires a non-empty sanitisation strategy version.",
    );
  }

  if (!Number.isSafeInteger(input.strategy.targetTokenEstimate)) {
    throw new ResourceChunkerError(
      "resource_chunker_invalid_input",
      "Resource chunker target token estimate must be a safe integer.",
    );
  }

  if (!Number.isSafeInteger(input.strategy.maximumTokenEstimate)) {
    throw new ResourceChunkerError(
      "resource_chunker_invalid_input",
      "Resource chunker maximum token estimate must be a safe integer.",
    );
  }

  if (!Number.isSafeInteger(input.strategy.overlapBlockCount)) {
    throw new ResourceChunkerError(
      "resource_chunker_invalid_input",
      "Resource chunker overlap block count must be a safe integer.",
    );
  }

  if (input.strategy.targetTokenEstimate <= 0) {
    throw new ResourceChunkerError(
      "resource_chunker_invalid_input",
      "Resource chunker target token estimate must be positive.",
    );
  }

  if (input.strategy.maximumTokenEstimate <= 0) {
    throw new ResourceChunkerError(
      "resource_chunker_invalid_input",
      "Resource chunker maximum token estimate must be positive.",
    );
  }

  if (input.strategy.targetTokenEstimate > input.strategy.maximumTokenEstimate) {
    throw new ResourceChunkerError(
      "resource_chunker_invalid_input",
      "Resource chunker target token estimate must not exceed the maximum token estimate.",
    );
  }

  if (input.strategy.overlapBlockCount < 0) {
    throw new ResourceChunkerError(
      "resource_chunker_invalid_input",
      "Resource chunker overlap block count must be non-negative.",
    );
  }

  if (input.blocks.length === 0) {
    throw new ResourceChunkerError(
      "resource_chunker_invalid_input",
      "Resource chunker requires at least one extracted content block.",
    );
  }

  for (const block of input.blocks) {
    assertBlockBelongsToDocument(input.document, block);
    assertBlockHasContent(block);
  }
}

function assertBlockBelongsToDocument(
  document: ResourceChunkerExtractionDocument,
  block: ResourceChunkerExtractedContentBlock,
): void {
  if (
    block.studentId !== document.studentId
    || block.resourceId !== document.resourceId
    || block.extractionDocumentId !== document.extractionDocumentId
  ) {
    throw new ResourceChunkerError(
      "resource_chunker_inconsistent_blocks",
      "Extracted content block does not belong to the extraction document being chunked.",
    );
  }
}

function assertBlockHasContent(
  block: ResourceChunkerExtractedContentBlock,
): void {
  if (normalizeBlockText(block.text).length === 0) {
    throw new ResourceChunkerError(
      "resource_chunker_invalid_input",
      "Resource chunker received an extracted content block with blank text.",
    );
  }
}

function compareBlocks(
  left: ResourceChunkerExtractedContentBlock,
  right: ResourceChunkerExtractedContentBlock,
): number {
  if (left.sortOrder !== right.sortOrder) {
    return left.sortOrder - right.sortOrder;
  }

  return String(left.blockId).localeCompare(String(right.blockId));
}

function buildChunks(
  input: ResourceChunkerInput,
  sortedBlocks: readonly ResourceChunkerExtractedContentBlock[],
): readonly CreateRetrievalChunkInput[] {
  const chunks: CreateRetrievalChunkInput[] = [];
  let pendingBlocks: PendingChunkBlock[] = [];

  const flushPendingBlocks = (): void => {
    if (pendingBlocks.length === 0) {
      return;
    }

    const sortOrder = chunks.length;
    chunks.push(createChunkFromBlocks(input, pendingBlocks, sortOrder));
    pendingBlocks = [];
  };

  for (const block of sortedBlocks) {
    const pendingBlock = toPendingChunkBlock(block);
    const pendingTokenEstimate = estimateTokensForBlocks(pendingBlocks);
    const blockTokenEstimate = estimateTokenCount(pendingBlock.normalizedText);
    const wouldExceedMaximum =
      pendingBlocks.length > 0
      && pendingTokenEstimate + blockTokenEstimate
        > input.strategy.maximumTokenEstimate;

    if (pendingBlock.kind === "heading" && pendingBlocks.length > 0) {
      flushPendingBlocks();
    }

    if (isSpecialContentKind(pendingBlock.kind)) {
      flushPendingBlocks();
      pendingBlocks = [pendingBlock];
      flushPendingBlocks();
      continue;
    }

    if (wouldExceedMaximum) {
      flushPendingBlocks();
    }

    pendingBlocks.push(pendingBlock);

    if (
      estimateTokensForBlocks(pendingBlocks)
      >= input.strategy.targetTokenEstimate
    ) {
      flushPendingBlocks();
    }
  }

  flushPendingBlocks();

  return chunks;
}

function toPendingChunkBlock(
  block: ResourceChunkerExtractedContentBlock,
): PendingChunkBlock {
  return {
    blockId: block.blockId,
    kind: block.kind,
    normalizedText: normalizeBlockText(block.text),
    locator: block.locator,
    sortOrder: block.sortOrder,
  };
}

function createChunkFromBlocks(
  input: ResourceChunkerInput,
  blocks: readonly PendingChunkBlock[],
  sortOrder: number,
): CreateRetrievalChunkInput {
  const text = blocks.map((block) => block.normalizedText).join("\n\n");
  const sourceBlockIds = blocks.map((block) => block.blockId);
  const firstBlock = blocks[0];

  if (firstBlock === undefined) {
    throw new ResourceChunkerError(
      "resource_chunker_empty_output",
      "Resource chunker attempted to create a chunk without source blocks.",
    );
  }

  return {
    chunkId: createDeterministicChunkId({
      studentId: input.document.studentId,
      resourceId: input.document.resourceId,
      extractionDocumentId: input.document.extractionDocumentId,
      chunkingStrategyVersion: input.strategy.chunkingStrategyVersion,
      sourceContentHash: input.sourceContentHash,
      sortOrder,
      sourceBlockIds,
    }),
    source: {
      studentId: input.document.studentId,
      resourceId: input.document.resourceId,
      extractionDocumentId: input.document.extractionDocumentId,
      sourceBlockIds,
      sourceContentHash: input.sourceContentHash,
    },
    scope: {
      termId: input.scope.termId,
      subjectId: input.scope.subjectId,
      structureUnitId: input.scope.structureUnitId,
      resourceId: input.document.resourceId,
    },
    content: {
      kind: resolveChunkContentKind(blocks),
      text,
      tokenEstimate: estimateTokenCount(text),
      sanitisation: {
        status: "sanitised",
        strategyVersion: input.strategy.sanitisationStrategyVersion,
        warnings: [],
      },
    },
    locator: firstBlock.locator,
    chunkingStrategyVersion: input.strategy.chunkingStrategyVersion,
    sortOrder,
  };
}

function resolveChunkContentKind(
  blocks: readonly PendingChunkBlock[],
): RetrievalChunkContentKind {
  const firstKind = blocks[0]?.kind;

  if (firstKind === undefined) {
    throw new ResourceChunkerError(
      "resource_chunker_empty_output",
      "Resource chunker attempted to resolve content kind for an empty chunk.",
    );
  }

  const allBlocksShareKind = blocks.every((block) => block.kind === firstKind);

  return allBlocksShareKind ? firstKind : "mixed";
}

function normalizeBlockText(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

function estimateTokensForBlocks(
  blocks: readonly PendingChunkBlock[],
): number {
  return blocks.reduce(
    (sum, block) => sum + estimateTokenCount(block.normalizedText),
    0,
  );
}

function estimateTokenCount(text: string): number {
  const normalizedText = normalizeBlockText(text);

  if (normalizedText.length === 0) {
    return 0;
  }

  return Math.ceil(normalizedText.length / 4);
}

function isSpecialContentKind(kind: RetrievalChunkContentKind): boolean {
  return specialContentKinds.has(kind);
}

function createDeterministicChunkId(input: Readonly<{
  studentId: RetrievalChunkSource["studentId"];
  resourceId: RetrievalChunkSource["resourceId"];
  extractionDocumentId: RetrievalChunkSource["extractionDocumentId"];
  chunkingStrategyVersion: RetrievalChunkingStrategyVersion;
  sourceContentHash: RetrievalChunkSource["sourceContentHash"];
  sortOrder: number;
  sourceBlockIds: readonly RetrievalExtractedContentBlockId[];
}>): RetrievalChunkId {
  const digest = createHash("sha256")
    .update(JSON.stringify({
      studentId: input.studentId,
      resourceId: input.resourceId,
      extractionDocumentId: input.extractionDocumentId,
      chunkingStrategyVersion: input.chunkingStrategyVersion,
      sourceContentHash: input.sourceContentHash,
      sortOrder: input.sortOrder,
      sourceBlockIds: input.sourceBlockIds,
    }))
    .digest();

  return formatUuidFromDigest(digest) as RetrievalChunkId;
}

function formatUuidFromDigest(digest: Buffer): string {
  const bytes = Buffer.from(digest.subarray(0, 16));

bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x50;
bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;

  const hex = bytes.toString("hex");

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}