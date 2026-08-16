import type {
  IsoDateTimeString,
} from "@avora/core/time";
import type {
  ExtractedPage,
  ExtractedResourceContent,
  ExtractionProvenance,
  ResourceChunkingStrategyVersion,
  ResourceExtractedContentBlock,
  ResourceExtractionDocument,
  ResourceExtractionDocumentId,
  ResourceExtractionFailure,
  ResourceExtractionFailureId,
  ResourceExtractionProvenanceId,
  ResourceExtractionRequest,
  ResourceExtractionStrategyVersion,
  ResourceStorageLocation,
} from "@avora/domain/resources";
import type {
  CreateResourceExtractedContentBlockInput,
  CreateResourceExtractedPageInput,
  CreateResourceExtractionDocumentInput,
  CreateResourceExtractionFailureInput,
  CreateResourceExtractionProvenanceInput,
  DbResourceChunkingStrategyVersion,
  DbResourceExtractedContentBlockId,
  DbResourceExtractedPageId,
  DbResourceExtractionDocumentId,
  DbResourceExtractionFailureId,
  DbResourceExtractionFailureRecord,
  DbResourceExtractionProvenanceId,
  DbResourceExtractionStrategyVersion,
  DbResourceSourceLocator,
  GetResourceExtractionDocumentCheckpointInput,
} from "@avora/db/repositories/extraction";
import type {
  ResourceExtractionJobPayload,
} from "@avora/jobs/resource-extraction";

export function mapResourceExtractionJobPayloadToRequest(
  payload: ResourceExtractionJobPayload,
): ResourceExtractionRequest {
  return {
    extractionDocumentId:
      payload.extractionDocumentId as unknown as ResourceExtractionDocumentId,
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

export function mapResourceExtractionRequestToCheckpointLookupInput(
  request: ResourceExtractionRequest,
): GetResourceExtractionDocumentCheckpointInput {
  return {
    studentId: request.studentId,
    resourceId: request.resourceId,
    extractionStrategyVersion:
      request.extractionStrategyVersion as unknown as DbResourceExtractionStrategyVersion,
    chunkingStrategyVersion:
      request.chunkingStrategyVersion as unknown as DbResourceChunkingStrategyVersion,
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

export function mapFailedResourceExtractionRequestToDocumentCreateInput(
  input: Readonly<{
    request: ResourceExtractionRequest;
    extractedAt: IsoDateTimeString;
  }>,
): CreateResourceExtractionDocumentInput {
  return {
    extractionDocumentId:
      mapResourceExtractionDocumentIdToDb(input.request.extractionDocumentId),
    studentId: input.request.studentId,
    resourceId: input.request.resourceId,
    status: "failed",
    extractionStrategyVersion:
      input.request.extractionStrategyVersion as unknown as DbResourceExtractionStrategyVersion,
    chunkingStrategyVersion:
      input.request.chunkingStrategyVersion as unknown as DbResourceChunkingStrategyVersion,
    extractedAt: input.extractedAt,
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

export function mapExtractedResourceContentBlockToCreateInput(
  content: ExtractedResourceContent,
  block: ResourceExtractedContentBlock,
): CreateResourceExtractedContentBlockInput {
  return {
    blockId: block.blockId as unknown as DbResourceExtractedContentBlockId,
    extractionDocumentId:
      mapResourceExtractionDocumentIdToDb(content.extractionDocumentId),
    studentId: content.studentId,
    resourceId: content.resourceId,
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

export function mapExtractedResourceContentBlocksToCreateInputs(
  content: ExtractedResourceContent,
): readonly CreateResourceExtractedContentBlockInput[] {
  return content.blocks.map((block) =>
    mapExtractedResourceContentBlockToCreateInput(content, block),
  );
}

export function mapExtractedResourceContentPagesToCreateInputs(
  content: ExtractedResourceContent,
): readonly CreateResourceExtractedPageInput[] {
  return content.pages.map((page) =>
    mapExtractedPageToCreateInput(content, page),
  );
}

export function mapExtractedPageToCreateInput(
  content: ExtractedResourceContent,
  page: ExtractedPage,
): CreateResourceExtractedPageInput {
  return {
    pageId: page.pageId as unknown as DbResourceExtractedPageId,
    extractionDocumentId:
      mapResourceExtractionDocumentIdToDb(content.extractionDocumentId),
    studentId: content.studentId,
    resourceId: content.resourceId,
    provenanceId:
      page.provenance.provenanceId as unknown as DbResourceExtractionProvenanceId,
    pageNumber: page.pageNumber,
    text: page.text,
    locator: page.locator as unknown as DbResourceSourceLocator,
    confidence: page.confidence,
  };
}

export function mapExtractedResourceContentPageProvenanceToCreateInputs(
  content: ExtractedResourceContent,
): readonly CreateResourceExtractionProvenanceInput[] {
  const provenanceById = new Map<
    ResourceExtractionProvenanceId,
    CreateResourceExtractionProvenanceInput
  >();

  for (const page of content.pages) {
    if (provenanceById.has(page.provenance.provenanceId)) {
      continue;
    }

    provenanceById.set(
      page.provenance.provenanceId,
      mapExtractionProvenanceToCreateInput({
        content,
        provenance: page.provenance,
        pageNumber: page.pageNumber,
      }),
    );
  }

  return [...provenanceById.values()];
}

export function mapExtractedResourceContentDocumentProvenanceToCreateInput(
  content: ExtractedResourceContent,
): CreateResourceExtractionProvenanceInput {
  return mapExtractionProvenanceToCreateInput({
    content,
    provenance: content.provenance,
    pageNumber: null,
  });
}

export function mapExtractedResourceContentProvenanceToCreateInputs(
  content: ExtractedResourceContent,
): readonly CreateResourceExtractionProvenanceInput[] {
  const provenanceById = new Map<
    ResourceExtractionProvenanceId,
    CreateResourceExtractionProvenanceInput
  >();

  const documentProvenance =
    mapExtractedResourceContentDocumentProvenanceToCreateInput(content);

  provenanceById.set(content.provenance.provenanceId, documentProvenance);

  for (const pageProvenance of mapExtractedResourceContentPageProvenanceToCreateInputs(
    content,
  )) {
    const provenanceId =
      pageProvenance.provenanceId as unknown as ResourceExtractionProvenanceId;

    if (provenanceById.has(provenanceId)) {
      continue;
    }

    provenanceById.set(provenanceId, pageProvenance);
  }

  return [...provenanceById.values()];
}

export function mapExtractionProvenanceToCreateInput(
  input: Readonly<{
    content: ExtractedResourceContent;
    provenance: ExtractionProvenance;
    pageNumber: number | null;
  }>,
): CreateResourceExtractionProvenanceInput {
  return {
    provenanceId:
      input.provenance.provenanceId as unknown as DbResourceExtractionProvenanceId,
    extractionDocumentId:
      mapResourceExtractionDocumentIdToDb(input.content.extractionDocumentId),
    studentId: input.content.studentId,
    resourceId: input.content.resourceId,
    pageNumber: input.pageNumber,
    source: input.provenance.source,
    strategyVersion:
      input.provenance.strategyVersion as unknown as DbResourceExtractionStrategyVersion,
    extractedAt: input.provenance.extractedAt,
    notes: input.provenance.notes,
  };
}

export function mapResourceExtractionFailureToCreateInput(
  input: Readonly<{
    request: ResourceExtractionRequest;
    failure: ResourceExtractionFailure;
    provenanceId: ResourceExtractionProvenanceId | null;
    pageNumber: number | null;
  }>,
): CreateResourceExtractionFailureInput {
  return {
    failureId: input.failure.failureId as unknown as DbResourceExtractionFailureId,
    extractionDocumentId:
      mapResourceExtractionDocumentIdToDb(input.request.extractionDocumentId),
    studentId: input.request.studentId,
    resourceId: input.request.resourceId,
    provenanceId:
      input.provenanceId as unknown as DbResourceExtractionProvenanceId | null,
    code: input.failure.code,
    pageNumber: input.pageNumber,
    message: input.failure.message,
  };
}

export function mapExtractedResourceContentFailuresToCreateInputs(
  input: Readonly<{
    request: ResourceExtractionRequest;
    content: ExtractedResourceContent;
    warning: ResourceExtractionFailure | null;
  }>,
): readonly CreateResourceExtractionFailureInput[] {
  const failuresById = new Map<
    ResourceExtractionFailureId,
    CreateResourceExtractionFailureInput
  >();

  if (input.warning !== null) {
    failuresById.set(
      input.warning.failureId,
      mapResourceExtractionFailureToCreateInput({
        request: input.request,
        failure: input.warning,
        provenanceId: null,
        pageNumber: getResourceExtractionFailurePageNumber(input.warning),
      }),
    );
  }

  for (const page of input.content.pages) {
    if (page.failure === null || failuresById.has(page.failure.failureId)) {
      continue;
    }

    failuresById.set(
      page.failure.failureId,
      mapResourceExtractionFailureToCreateInput({
        request: input.request,
        failure: page.failure,
        provenanceId: page.provenance.provenanceId,
        pageNumber: page.failure.pageNumber,
      }),
    );
  }

  return [...failuresById.values()];
}

export function mapDbResourceExtractionFailureToDomainFailure(
  failure: DbResourceExtractionFailureRecord,
): ResourceExtractionFailure {
  return {
    failureId: failure.failureId as unknown as ResourceExtractionFailureId,
    code: failure.code,
    message: failure.message,
  };
}

export function mapResourceExtractionDocumentIdToDb(
  extractionDocumentId: ResourceExtractionDocumentId,
): DbResourceExtractionDocumentId {
  return extractionDocumentId as unknown as DbResourceExtractionDocumentId;
}

function getResourceExtractionFailurePageNumber(
  failure: ResourceExtractionFailure,
): number | null {
  if ("pageNumber" in failure && typeof failure.pageNumber === "number") {
    return failure.pageNumber;
  }

  return null;
}