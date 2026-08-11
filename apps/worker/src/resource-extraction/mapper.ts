import type {
  ResourceChunkingStrategyVersion,
  ResourceExtractedContentBlock,
  ResourceExtractionDocument,
  ResourceExtractionDocumentId,
  ResourceExtractionRequest,
  ResourceExtractionStrategyVersion,
  ResourceStorageLocation,
} from "@avora/domain/resources";
import type {
  CreateResourceExtractedContentBlockInput,
  CreateResourceExtractionDocumentInput,
  DbResourceChunkingStrategyVersion,
  DbResourceExtractedContentBlockId,
  DbResourceExtractionDocumentId,
  DbResourceExtractionStrategyVersion,
  DbResourceSourceLocator,
} from "@avora/db/repositories/extraction";
import type {
  ResourceExtractionJobPayload,
} from "@avora/jobs/resource-extraction";

export function mapResourceExtractionJobPayloadToRequest(
  payload: ResourceExtractionJobPayload,
): ResourceExtractionRequest {
  return {
    studentId: payload.studentId,
    resourceId: payload.resourceId,
    storage: payload.storage as unknown as ResourceStorageLocation,
    declaredMimeType: payload.declaredMimeType,
    contentHash: payload.contentHash,
    extractionStrategyVersion:
      payload.extractionStrategyVersion as ResourceExtractionStrategyVersion,
    chunkingStrategyVersion:
      payload.chunkingStrategyVersion as ResourceChunkingStrategyVersion,
  };
}

export function mapResourceExtractionDocumentToCreateInput(
  document: ResourceExtractionDocument,
): CreateResourceExtractionDocumentInput {
  return {
    extractionDocumentId:
      mapResourceExtractionDocumentIdToDb(document.extractionDocumentId),
    studentId: document.studentId,
    resourceId: document.resourceId,
    status: document.status,
    extractionStrategyVersion:
      document.extractionStrategyVersion as unknown as DbResourceExtractionStrategyVersion,
    chunkingStrategyVersion:
      document.chunkingStrategyVersion as unknown as DbResourceChunkingStrategyVersion,
    extractedAt: document.extractedAt,
  };
}

export function mapResourceExtractedContentBlockToCreateInput(
  document: ResourceExtractionDocument,
  block: ResourceExtractedContentBlock,
): CreateResourceExtractedContentBlockInput {
  return {
    blockId: block.blockId as unknown as DbResourceExtractedContentBlockId,
    extractionDocumentId:
      mapResourceExtractionDocumentIdToDb(document.extractionDocumentId),
    studentId: document.studentId,
    resourceId: document.resourceId,
    kind: block.kind,
    text: block.text,
    locator: block.locator as unknown as DbResourceSourceLocator,
    sortOrder: block.sortOrder,
    parentBlockId:
      block.parentBlockId as unknown as DbResourceExtractedContentBlockId | null,
    confidence: block.confidence,
  };
}

export function mapResourceExtractionDocumentBlocksToCreateInputs(
  document: ResourceExtractionDocument,
): readonly CreateResourceExtractedContentBlockInput[] {
  return document.blocks.map((block) =>
    mapResourceExtractedContentBlockToCreateInput(document, block),
  );
}

export function mapResourceExtractionDocumentIdToDb(
  extractionDocumentId: ResourceExtractionDocumentId,
): DbResourceExtractionDocumentId {
  return extractionDocumentId as unknown as DbResourceExtractionDocumentId;
}