import type {
  ResourceId,
  StudentId,
} from "@avora/core/identity";
import type {
  IsoDateTimeString,
} from "@avora/core/time";
import type {
  ExtractionPort,
  ResourceExtractionRequest,
} from "@avora/domain/resources";
import {
  createResourceExtractionService,
} from "@avora/domain/resources";
import type {
  CreateResourceExtractedContentBlockInput,
  CreateResourceExtractedPageInput,
  CreateResourceExtractionDocumentInput,
  CreateResourceExtractionDocumentWithBlocksInput,
  CreateResourceExtractionFailureInput,
  CreateResourceExtractionProvenanceInput,
  DbResourceChunkingStrategyVersion,
  DbResourceExtractedContentBlockId,
  DbResourceExtractedContentBlockNode,
  DbResourceExtractedContentBlockRecord,
  DbResourceExtractedPageRecord,
  DbResourceExtractionDocumentId,
  DbResourceExtractionDocumentRecord,
  DbResourceExtractionDocumentTree,
  DbResourceExtractionDocumentWithBlocks,
  DbResourceExtractionFailureId,
  DbResourceExtractionFailureRecord,
  DbResourceExtractionProvenanceId,
  DbResourceExtractionProvenanceRecord,
  DbResourceExtractionStrategyVersion,
  ResourceExtractionRepository,
} from "@avora/db/repositories/extraction";
import type {
  DbResourceLifecycleState,
  DbResourceRecord,
  ResourcesRepository,
} from "@avora/db/repositories/resources";
import type {
  ResourceExtractionJobRequest,
} from "@avora/jobs/resource-extraction";
import {
  resourceExtractionJobName,
} from "@avora/jobs/resource-extraction";

import {
  createResourceExtractionE2eJobRequest,
  createResourceExtractionE2eResult,
  resourceExtractionE2eFailedFixture,
  resourceExtractionE2ePartialFixture,
  resourceExtractionE2eSuccessFixture,
} from "./resource-extraction.fixture.js";
import type {
  ResourceExtractionE2eFixture,
  ResourceExtractionE2eScenario,
} from "./resource-extraction.fixture.js";

export type ResourceExtractionE2eCaseResult = Readonly<{
  name: string;
  scenario: ResourceExtractionE2eScenario;
}>;

type ResourceProcessingStatusProjection = Readonly<{
  resourceLifecycleState: DbResourceLifecycleState;
  processingStatus: "ready" | "partially_ready" | "failed";
  extractionOutcome: DbResourceExtractionDocumentRecord["status"];
}>;

type E2eWorkerResult = Readonly<{
  outcome: "extracted" | "partially_extracted" | "failed";
  extractionDocumentId: DbResourceExtractionDocumentId;
  persistedBlockCount: number;
  failure: DbResourceExtractionFailureRecord | null;
}>;

export async function runResourceExtractionE2eHarness():
  Promise<readonly ResourceExtractionE2eCaseResult[]> {
  const cases = [
    await runSuccessfulExtractionScenario(),
    await runPartialExtractionScenario(),
    await runFailedExtractionScenario(),
  ];

  if (cases.length === 0) {
    throw new Error("Stage 10 Group 7 resource extraction e2e harness has no cases");
  }

  return cases;
}

async function runSuccessfulExtractionScenario():
  Promise<ResourceExtractionE2eCaseResult> {
  const state = createHarnessState({
    fixture: resourceExtractionE2eSuccessFixture,
    scenario: "success",
  });

  const result = await runWorkerCompatibleFlow({
    job: createResourceExtractionE2eJobRequest({
      fixture: resourceExtractionE2eSuccessFixture,
    }),
    resourcesRepository: state.resourcesRepository,
    extractionRepository: state.extractionRepository,
    extractionPort: state.extractionPort,
  });

  assertEqual(result.outcome, "extracted", "success worker outcome");
  assertEqual(result.persistedBlockCount, 2, "success persisted block count");
  assertEqual(result.failure, null, "success worker failure");

  const resource = state.resourcesRepository.readSeededResource(
    resourceExtractionE2eSuccessFixture.resourceId,
  );
  assertEqual(resource.lifecycleState, "ready", "success resource lifecycle");

  const document = state.extractionRepository.requireDocument(
    resourceExtractionE2eSuccessFixture.extractionDocumentId as unknown as DbResourceExtractionDocumentId,
  );
  assertEqual(document.status, "extracted", "success extraction document status");
  assertEqual(
    document.resourceId,
    resourceExtractionE2eSuccessFixture.resourceId,
    "success document resource association",
  );

  assertEqual(
    state.extractionRepository.listPages(document.extractionDocumentId).length,
    1,
    "success persisted page count",
  );
  assertEqual(
    state.extractionRepository.listBlocks(document.extractionDocumentId).length,
    2,
    "success persisted block count",
  );
  assertEqual(
    state.extractionRepository.listProvenance(document.extractionDocumentId)
      .some((record) => record.pageNumber === null),
    true,
    "success document provenance persisted",
  );

  const status = projectResourceProcessingStatus({
    resource,
    extractionRepository: state.extractionRepository,
  });

  assertEqual(status.resourceLifecycleState, "ready", "success status lifecycle");
  assertEqual(status.processingStatus, "ready", "success processing status");
  assertEqual(status.extractionOutcome, "extracted", "success status outcome");

  return {
    name: "successful extraction reaches ready status",
    scenario: "success",
  };
}

async function runPartialExtractionScenario():
  Promise<ResourceExtractionE2eCaseResult> {
  const state = createHarnessState({
    fixture: resourceExtractionE2ePartialFixture,
    scenario: "partial",
  });

  const result = await runWorkerCompatibleFlow({
    job: createResourceExtractionE2eJobRequest({
      fixture: resourceExtractionE2ePartialFixture,
    }),
    resourcesRepository: state.resourcesRepository,
    extractionRepository: state.extractionRepository,
    extractionPort: state.extractionPort,
  });

  assertEqual(result.outcome, "partially_extracted", "partial worker outcome");
  assertEqual(result.persistedBlockCount, 1, "partial persisted block count");
  assertNotNull(result.failure, "partial warning failure");

  const resource = state.resourcesRepository.readSeededResource(
    resourceExtractionE2ePartialFixture.resourceId,
  );
  assertEqual(resource.lifecycleState, "ready", "partial resource lifecycle");

  const document = state.extractionRepository.requireDocument(
    resourceExtractionE2ePartialFixture.extractionDocumentId as unknown as DbResourceExtractionDocumentId,
  );
  assertEqual(
    document.status,
    "partially_extracted",
    "partial extraction document status",
  );

  const pages = state.extractionRepository.listPages(document.extractionDocumentId);
  const failures = state.extractionRepository.listFailures(
    document.extractionDocumentId,
  );

  assertEqual(pages.length, 2, "partial persisted page count");
  assertEqual(
    state.extractionRepository.listBlocks(document.extractionDocumentId).length,
    1,
    "partial persisted block count",
  );
  assertEqual(
    failures.some((failure) =>
      failure.code === "unsupported_page" && failure.pageNumber === 2,
    ),
    true,
    "partial unsupported page failure persisted with page number",
  );
  assertEqual(
    state.extractionRepository.listProvenance(document.extractionDocumentId)
      .some((record) => record.pageNumber === null),
    true,
    "partial document provenance persisted",
  );

  const status = projectResourceProcessingStatus({
    resource,
    extractionRepository: state.extractionRepository,
  });

  assertEqual(status.resourceLifecycleState, "ready", "partial status lifecycle");
  assertEqual(
    status.processingStatus,
    "partially_ready",
    "partial processing status must remain partially_ready",
  );
  assertEqual(
    status.extractionOutcome,
    "partially_extracted",
    "partial status outcome",
  );

  return {
    name: "partial extraction reaches partially_ready status",
    scenario: "partial",
  };
}

async function runFailedExtractionScenario():
  Promise<ResourceExtractionE2eCaseResult> {
  const state = createHarnessState({
    fixture: resourceExtractionE2eFailedFixture,
    scenario: "failed",
  });

  const result = await runWorkerCompatibleFlow({
    job: createResourceExtractionE2eJobRequest({
      fixture: resourceExtractionE2eFailedFixture,
    }),
    resourcesRepository: state.resourcesRepository,
    extractionRepository: state.extractionRepository,
    extractionPort: state.extractionPort,
  });

  assertEqual(result.outcome, "failed", "failed worker outcome");
  assertEqual(result.persistedBlockCount, 0, "failed persisted block count");
  assertNotNull(result.failure, "failed terminal failure");

  const resource = state.resourcesRepository.readSeededResource(
    resourceExtractionE2eFailedFixture.resourceId,
  );
  assertEqual(resource.lifecycleState, "failed", "failed resource lifecycle");

  const document = state.extractionRepository.requireDocument(
    resourceExtractionE2eFailedFixture.extractionDocumentId as unknown as DbResourceExtractionDocumentId,
  );
  assertEqual(document.status, "failed", "failed extraction document status");

  const failures = state.extractionRepository.listFailures(
    document.extractionDocumentId,
  );

  assertEqual(failures.length, 1, "failed persisted failure count");
  assertEqual(failures[0]?.code, "extractor_failed", "failed failure code");

  const status = projectResourceProcessingStatus({
    resource,
    extractionRepository: state.extractionRepository,
  });

  assertEqual(status.resourceLifecycleState, "failed", "failed status lifecycle");
  assertEqual(status.processingStatus, "failed", "failed processing status");
  assertEqual(status.extractionOutcome, "failed", "failed status outcome");

  return {
    name: "terminal extraction failure reaches failed status",
    scenario: "failed",
  };
}

function createHarnessState(
  input: Readonly<{
    fixture: ResourceExtractionE2eFixture;
    scenario: ResourceExtractionE2eScenario;
  }>,
): Readonly<{
  resourcesRepository: InMemoryResourcesRepository;
  extractionRepository: InMemoryResourceExtractionRepository;
  extractionPort: ExtractionPort;
}> {
  const resourcesRepository = new InMemoryResourcesRepository([
    createUploadedResource(input.fixture),
  ]);

  return {
    resourcesRepository,
    extractionRepository: new InMemoryResourceExtractionRepository(),
    extractionPort: {
      extractResourceContent: () => Promise.resolve(
        createResourceExtractionE2eResult(input),
      ),
    },
  };
}

async function runWorkerCompatibleFlow(
  input: Readonly<{
    job: ResourceExtractionJobRequest;
    resourcesRepository: InMemoryResourcesRepository;
    extractionRepository: InMemoryResourceExtractionRepository;
    extractionPort: ExtractionPort;
  }>,
): Promise<E2eWorkerResult> {
  assertResourceExtractionJob(input.job);

  const extractionRequest = mapJobRequestToExtractionRequest(input.job);
  const extractionService = createResourceExtractionService({
    extractor: input.extractionPort,
  });

  const existingBeforeProcessing =
    await input.extractionRepository.getResourceExtractionDocumentCheckpoint({
      studentId: extractionRequest.studentId,
      resourceId: extractionRequest.resourceId,
      extractionStrategyVersion:
        extractionRequest.extractionStrategyVersion as unknown as DbResourceExtractionStrategyVersion,
      chunkingStrategyVersion:
        extractionRequest.chunkingStrategyVersion as unknown as DbResourceChunkingStrategyVersion,
    });

  if (existingBeforeProcessing !== null) {
    await convergeResourceLifecycle({
      resourcesRepository: input.resourcesRepository,
      extractionRepository: input.extractionRepository,
      document: existingBeforeProcessing,
    });

    return mapExistingDocumentToWorkerResult({
      document: existingBeforeProcessing,
      extractionRepository: input.extractionRepository,
    });
  }

  await input.resourcesRepository.markResourceProcessing({
    studentId: extractionRequest.studentId,
    resourceId: extractionRequest.resourceId,
  });

  const extractionResult = await extractionService.extractResource(
    extractionRequest,
  );

  if (extractionResult.outcome === "failed") {
    const document = await input.extractionRepository
      .createResourceExtractionDocumentCheckpoint({
        extractionDocumentId:
          extractionRequest.extractionDocumentId as unknown as DbResourceExtractionDocumentId,
        studentId: extractionRequest.studentId,
        resourceId: extractionRequest.resourceId,
        status: "failed",
        extractionStrategyVersion:
          extractionRequest.extractionStrategyVersion as unknown as DbResourceExtractionStrategyVersion,
        chunkingStrategyVersion:
          extractionRequest.chunkingStrategyVersion as unknown as DbResourceChunkingStrategyVersion,
        extractedAt: input.job.payload.requestedAt,
      });

    const persistedFailures = await input.extractionRepository
      .createResourceExtractionFailuresCheckpoint([
        {
          failureId:
            extractionResult.failure.failureId as unknown as DbResourceExtractionFailureId,
          extractionDocumentId: document.extractionDocumentId,
          studentId: extractionRequest.studentId,
          resourceId: extractionRequest.resourceId,
          provenanceId: null,
          code: extractionResult.failure.code,
          pageNumber: null,
          message: extractionResult.failure.message,
        },
      ]);

    await input.resourcesRepository.markResourceFailed({
      studentId: extractionRequest.studentId,
      resourceId: extractionRequest.resourceId,
      reason: extractionResult.failure.message,
    });

    return {
      outcome: "failed",
      extractionDocumentId: document.extractionDocumentId,
      persistedBlockCount: 0,
      failure: persistedFailures[0] ?? null,
    };
  }

  const document = await input.extractionRepository
    .createResourceExtractionDocumentCheckpoint({
      extractionDocumentId:
        extractionResult.document.extractionDocumentId as unknown as DbResourceExtractionDocumentId,
      studentId: extractionResult.document.studentId,
      resourceId: extractionResult.document.resourceId,
      status: extractionResult.document.status,
      extractionStrategyVersion:
        extractionResult.document.extractionStrategyVersion as unknown as DbResourceExtractionStrategyVersion,
      chunkingStrategyVersion:
        extractionResult.document.chunkingStrategyVersion as unknown as DbResourceChunkingStrategyVersion,
      extractedAt: extractionResult.document.extractedAt,
    });

  for (const page of extractionResult.content.pages) {
    await input.extractionRepository.createResourceExtractionProvenanceCheckpoint({
      provenanceId:
        page.provenance.provenanceId as unknown as DbResourceExtractionProvenanceId,
      extractionDocumentId: document.extractionDocumentId,
      studentId: extractionResult.content.studentId,
      resourceId: extractionResult.content.resourceId,
      pageNumber: page.pageNumber,
      source: page.provenance.source,
      strategyVersion:
        page.provenance.strategyVersion as unknown as DbResourceExtractionStrategyVersion,
      extractedAt: page.provenance.extractedAt,
      notes: page.provenance.notes,
    });
  }

  await input.extractionRepository.createResourceExtractedPagesCheckpoint(
    extractionResult.content.pages.map((page) => ({
      pageId: page.pageId as unknown as DbResourceExtractedPageRecord["pageId"],
      extractionDocumentId: document.extractionDocumentId,
      studentId: extractionResult.content.studentId,
      resourceId: extractionResult.content.resourceId,
      provenanceId:
        page.provenance.provenanceId as unknown as DbResourceExtractionProvenanceId,
      pageNumber: page.pageNumber,
      text: page.text,
      locator: page.locator,
      confidence: page.confidence,
    })),
  );

  const blocks = await input.extractionRepository
    .createResourceExtractedContentBlocksCheckpoint(
      extractionResult.content.blocks.map((block) => ({
        blockId:
          block.blockId as unknown as DbResourceExtractedContentBlockRecord["blockId"],
        extractionDocumentId: document.extractionDocumentId,
        studentId: extractionResult.content.studentId,
        resourceId: extractionResult.content.resourceId,
        kind: block.kind,
        text: block.text,
        locator: block.locator,
        sortOrder: block.sortOrder,
        parentBlockId:
          block.parentBlockId as unknown as DbResourceExtractedContentBlockId | null,
        confidence: block.confidence,
      })),
    );

  const failures = await input.extractionRepository
    .createResourceExtractionFailuresCheckpoint([
      ...(extractionResult.outcome === "partially_extracted"
        ? [
          {
            failureId:
              extractionResult.warning.failureId as unknown as DbResourceExtractionFailureId,
            extractionDocumentId: document.extractionDocumentId,
            studentId: extractionResult.content.studentId,
            resourceId: extractionResult.content.resourceId,
            provenanceId: null,
            code: extractionResult.warning.code,
            pageNumber: null,
            message: extractionResult.warning.message,
          } satisfies CreateResourceExtractionFailureInput,
        ]
        : []),
      ...extractionResult.content.pages
        .filter((page) => page.failure !== null)
        .map((page) => ({
          failureId:
            page.failure!.failureId as unknown as DbResourceExtractionFailureId,
          extractionDocumentId: document.extractionDocumentId,
          studentId: extractionResult.content.studentId,
          resourceId: extractionResult.content.resourceId,
          provenanceId:
            page.provenance.provenanceId as unknown as DbResourceExtractionProvenanceId,
          code: page.failure!.code,
          pageNumber: page.failure!.pageNumber,
          message: page.failure!.message,
        })),
    ]);

  await input.extractionRepository.createResourceExtractionProvenanceCheckpoint({
    provenanceId:
      extractionResult.content.provenance.provenanceId as unknown as DbResourceExtractionProvenanceId,
    extractionDocumentId: document.extractionDocumentId,
    studentId: extractionResult.content.studentId,
    resourceId: extractionResult.content.resourceId,
    pageNumber: null,
    source: extractionResult.content.provenance.source,
    strategyVersion:
      extractionResult.content.provenance.strategyVersion as unknown as DbResourceExtractionStrategyVersion,
    extractedAt: extractionResult.content.provenance.extractedAt,
    notes: extractionResult.content.provenance.notes,
  });

  await input.resourcesRepository.markResourceReady({
    studentId: extractionRequest.studentId,
    resourceId: extractionRequest.resourceId,
  });

  return {
    outcome: extractionResult.outcome,
    extractionDocumentId: document.extractionDocumentId,
    persistedBlockCount: blocks.length,
    failure: failures[0] ?? null,
  };
}

async function convergeResourceLifecycle(
  input: Readonly<{
    resourcesRepository: InMemoryResourcesRepository;
    extractionRepository: InMemoryResourceExtractionRepository;
    document: DbResourceExtractionDocumentRecord;
  }>,
): Promise<void> {
  if (input.document.status === "failed") {
    const failure = input.extractionRepository
      .listFailures(input.document.extractionDocumentId)[0];

    await input.resourcesRepository.markResourceFailed({
      studentId: input.document.studentId,
      resourceId: input.document.resourceId,
      reason: failure?.message ?? "Resource extraction failed.",
    });

    return;
  }

  await input.resourcesRepository.markResourceReady({
    studentId: input.document.studentId,
    resourceId: input.document.resourceId,
  });
}

function assertResourceExtractionJob(job: ResourceExtractionJobRequest): void {
  assertEqual(job.name, resourceExtractionJobName, "resource extraction job name");
  assertNonEmpty(job.payload.extractionDocumentId, "extraction document id");
  assertNonEmpty(job.payload.storage.objectPath, "storage object path");
  assertNonEmpty(job.payload.declaredMimeType, "declared MIME type");
  assertNonEmpty(job.payload.contentHash, "content hash");
  assertNonEmpty(job.payload.extractionStrategyVersion, "extraction strategy version");
  assertNonEmpty(job.payload.chunkingStrategyVersion, "chunking strategy version");
  assertNonEmpty(job.payload.requestedAt, "requested timestamp");

  if (!Number.isSafeInteger(job.payload.byteSize) || job.payload.byteSize < 0) {
    throw new Error("Expected resource extraction job byte size to be non-negative.");
  }
}

function mapJobRequestToExtractionRequest(
  job: ResourceExtractionJobRequest,
): ResourceExtractionRequest {
  return {
    extractionDocumentId:
      job.payload.extractionDocumentId as ResourceExtractionRequest["extractionDocumentId"],
    studentId: job.payload.studentId,
    resourceId: job.payload.resourceId,
    storage: {
      bucket: "originals",
      objectPath: job.payload.storage.objectPath,
      version: 1,
    },
    declaredMimeType: job.payload.declaredMimeType,
    contentHash: job.payload.contentHash,
    extractionStrategyVersion:
      job.payload.extractionStrategyVersion as ResourceExtractionRequest["extractionStrategyVersion"],
    chunkingStrategyVersion:
      job.payload.chunkingStrategyVersion as ResourceExtractionRequest["chunkingStrategyVersion"],
  };
}

function mapExistingDocumentToWorkerResult(
  input: Readonly<{
    document: DbResourceExtractionDocumentRecord;
    extractionRepository: InMemoryResourceExtractionRepository;
  }>,
): E2eWorkerResult {
  const blocks = input.extractionRepository.listBlocks(
    input.document.extractionDocumentId,
  );
  const failures = input.extractionRepository.listFailures(
    input.document.extractionDocumentId,
  );

  return {
    outcome: input.document.status,
    extractionDocumentId: input.document.extractionDocumentId,
    persistedBlockCount: blocks.length,
    failure: failures[0] ?? null,
  };
}

function projectResourceProcessingStatus(
  input: Readonly<{
    resource: DbResourceRecord;
    extractionRepository: InMemoryResourceExtractionRepository;
  }>,
): ResourceProcessingStatusProjection {
  const latestDocument = input.extractionRepository
    .listResourceExtractionDocumentsByResourceSync({
      studentId: input.resource.studentId,
      resourceId: input.resource.resourceId,
    })[0];

  if (latestDocument === undefined) {
    throw new Error("Expected extraction document before projecting status.");
  }

  if (input.resource.lifecycleState === "ready") {
    return {
      resourceLifecycleState: "ready",
      processingStatus:
        latestDocument.status === "partially_extracted"
          ? "partially_ready"
          : "ready",
      extractionOutcome: latestDocument.status,
    };
  }

  if (input.resource.lifecycleState === "failed") {
    return {
      resourceLifecycleState: "failed",
      processingStatus: "failed",
      extractionOutcome: latestDocument.status,
    };
  }

  throw new Error(
    `Unexpected resource lifecycle for terminal extraction status: ${input.resource.lifecycleState}`,
  );
}

function createUploadedResource(
  fixture: ResourceExtractionE2eFixture,
): DbResourceRecord {
  return {
    resourceId: fixture.resourceId,
    studentId: fixture.studentId,
    kind: "document",
    originalFilename: fixture.originalFilename,
    declaredMimeType: fixture.declaredMimeType,
    byteSize: fixture.byteSize,
    contentHash: fixture.contentHash,
    lifecycleState: "uploaded",
    storage: {
      bucket: "originals",
      objectPath: fixture.storage.objectPath,
      version: 1,
    },
    createdAt: fixture.requestedAt,
    updatedAt: fixture.requestedAt,
  };
}

class InMemoryResourcesRepository implements ResourcesRepository {
  private readonly resources = new Map<ResourceId, DbResourceRecord>();

  public constructor(resources: readonly DbResourceRecord[]) {
    for (const resource of resources) {
      this.resources.set(resource.resourceId, resource);
    }
  }

  public readSeededResource(resourceId: ResourceId): DbResourceRecord {
    const resource = this.resources.get(resourceId);

    if (resource === undefined) {
      throw new Error(`Expected seeded resource ${resourceId}.`);
    }

    return resource;
  }

  public createPendingUpload(): Promise<DbResourceRecord> {
    return Promise.reject(new Error("createPendingUpload is outside G7 scope."));
  }

  public markUploadCompleted(): Promise<DbResourceRecord> {
    return Promise.reject(new Error("markUploadCompleted is outside G7 scope."));
  }

  public getResourceForIngestion(
    input: Readonly<{
      studentId: StudentId;
      resourceId: ResourceId;
    }>,
  ): Promise<DbResourceRecord | null> {
    return Promise.resolve(this.getResource(input));
  }

  public markResourceProcessing(
    input: Readonly<{
      studentId: StudentId;
      resourceId: ResourceId;
    }>,
  ): Promise<DbResourceRecord> {
    const resource = this.requireResource(input);

    if (
      resource.lifecycleState !== "uploaded"
      && resource.lifecycleState !== "processing"
    ) {
      return Promise.reject(
        new Error(`Cannot mark resource processing from ${resource.lifecycleState}.`),
      );
    }

    return Promise.resolve(this.updateResource(resource, "processing"));
  }

  public markResourceReady(
    input: Readonly<{
      studentId: StudentId;
      resourceId: ResourceId;
    }>,
  ): Promise<DbResourceRecord> {
    const resource = this.requireResource(input);

    if (
      resource.lifecycleState !== "processing"
      && resource.lifecycleState !== "ready"
    ) {
      return Promise.reject(
        new Error(`Cannot mark resource ready from ${resource.lifecycleState}.`),
      );
    }

    return Promise.resolve(this.updateResource(resource, "ready"));
  }

  public markResourceFailed(
    input: Readonly<{
      studentId: StudentId;
      resourceId: ResourceId;
      reason: string;
    }>,
  ): Promise<DbResourceRecord> {
    const resource = this.requireResource(input);

    if (
      resource.lifecycleState !== "processing"
      && resource.lifecycleState !== "failed"
    ) {
      return Promise.reject(
        new Error(`Cannot mark resource failed from ${resource.lifecycleState}.`),
      );
    }

    return Promise.resolve(this.updateResource(resource, "failed"));
  }

  public markResourceRejected(): Promise<DbResourceRecord> {
    return Promise.reject(new Error("markResourceRejected is outside G7 scope."));
  }

  public getById(
    input: Readonly<{
      studentId: StudentId;
      resourceId: ResourceId;
    }>,
  ): Promise<DbResourceRecord | null> {
    return Promise.resolve(this.getResource(input));
  }

  private getResource(
    input: Readonly<{
      studentId: StudentId;
      resourceId: ResourceId;
    }>,
  ): DbResourceRecord | null {
    const resource = this.resources.get(input.resourceId);

    if (resource === undefined || resource.studentId !== input.studentId) {
      return null;
    }

    return resource;
  }

  private requireResource(
    input: Readonly<{
      studentId: StudentId;
      resourceId: ResourceId;
    }>,
  ): DbResourceRecord {
    const resource = this.getResource(input);

    if (resource === null) {
      throw new Error(`Expected resource ${input.resourceId}.`);
    }

    return resource;
  }

  private updateResource(
    resource: DbResourceRecord,
    lifecycleState: DbResourceLifecycleState,
  ): DbResourceRecord {
    const updated = {
      ...resource,
      lifecycleState,
      updatedAt: now(),
    } satisfies DbResourceRecord;

    this.resources.set(updated.resourceId, updated);

    return updated;
  }
}

class InMemoryResourceExtractionRepository implements ResourceExtractionRepository {
  private readonly documents = new Map<
    DbResourceExtractionDocumentId,
    DbResourceExtractionDocumentRecord
  >();

  private readonly blocks = new Map<
    DbResourceExtractedContentBlockId,
    DbResourceExtractedContentBlockRecord
  >();

  private readonly provenance = new Map<
    DbResourceExtractionProvenanceId,
    DbResourceExtractionProvenanceRecord
  >();

  private readonly pages = new Map<
    string,
    DbResourceExtractedPageRecord
  >();

  private readonly failures = new Map<
    DbResourceExtractionFailureId,
    DbResourceExtractionFailureRecord
  >();

  public requireDocument(
    extractionDocumentId: DbResourceExtractionDocumentId,
  ): DbResourceExtractionDocumentRecord {
    const document = this.documents.get(extractionDocumentId);

    if (document === undefined) {
      throw new Error(`Expected extraction document ${extractionDocumentId}.`);
    }

    return document;
  }

  public listBlocks(
    extractionDocumentId: DbResourceExtractionDocumentId,
  ): readonly DbResourceExtractedContentBlockRecord[] {
    return [...this.blocks.values()]
      .filter((block) => block.extractionDocumentId === extractionDocumentId)
      .sort((left, right) =>
        left.sortOrder === right.sortOrder
          ? left.blockId.localeCompare(right.blockId)
          : left.sortOrder - right.sortOrder,
      );
  }

  public listPages(
    extractionDocumentId: DbResourceExtractionDocumentId,
  ): readonly DbResourceExtractedPageRecord[] {
    return [...this.pages.values()]
      .filter((page) => page.extractionDocumentId === extractionDocumentId)
      .sort((left, right) => left.pageNumber - right.pageNumber);
  }

  public listFailures(
    extractionDocumentId: DbResourceExtractionDocumentId,
  ): readonly DbResourceExtractionFailureRecord[] {
    return [...this.failures.values()]
      .filter((failure) => failure.extractionDocumentId === extractionDocumentId)
      .sort((left, right) =>
        (left.pageNumber ?? 0) === (right.pageNumber ?? 0)
          ? left.failureId.localeCompare(right.failureId)
          : (left.pageNumber ?? 0) - (right.pageNumber ?? 0),
      );
  }

  public listProvenance(
    extractionDocumentId: DbResourceExtractionDocumentId,
  ): readonly DbResourceExtractionProvenanceRecord[] {
    return [...this.provenance.values()]
      .filter((record) => record.extractionDocumentId === extractionDocumentId)
      .sort((left, right) =>
        (left.pageNumber ?? 0) === (right.pageNumber ?? 0)
          ? left.provenanceId.localeCompare(right.provenanceId)
          : (left.pageNumber ?? 0) - (right.pageNumber ?? 0),
      );
  }

  public createResourceExtractionDocument(
    input: CreateResourceExtractionDocumentInput,
  ): Promise<DbResourceExtractionDocumentRecord> {
    return this.createResourceExtractionDocumentCheckpoint(input);
  }

  public createResourceExtractionDocumentCheckpoint(
    input: CreateResourceExtractionDocumentInput,
  ): Promise<DbResourceExtractionDocumentRecord> {
    const existing = this.getResourceExtractionDocumentCheckpointSync({
      studentId: input.studentId,
      resourceId: input.resourceId,
      extractionStrategyVersion: input.extractionStrategyVersion,
      chunkingStrategyVersion: input.chunkingStrategyVersion,
    });

    if (existing !== null) {
      return Promise.resolve(existing);
    }

    const record = {
      ...input,
      createdAt: now(),
      updatedAt: now(),
    } satisfies DbResourceExtractionDocumentRecord;

    this.documents.set(record.extractionDocumentId, record);

    return Promise.resolve(record);
  }

  public getResourceExtractionDocumentCheckpoint(
    input: Readonly<{
      studentId: StudentId;
      resourceId: ResourceId;
      extractionStrategyVersion: DbResourceExtractionStrategyVersion;
      chunkingStrategyVersion: DbResourceChunkingStrategyVersion;
    }>,
  ): Promise<DbResourceExtractionDocumentRecord | null> {
    return Promise.resolve(this.getResourceExtractionDocumentCheckpointSync(input));
  }

  public getResourceExtractionDocumentCheckpointSync(
    input: Readonly<{
      studentId: StudentId;
      resourceId: ResourceId;
      extractionStrategyVersion: DbResourceExtractionStrategyVersion;
      chunkingStrategyVersion: DbResourceChunkingStrategyVersion;
    }>,
  ): DbResourceExtractionDocumentRecord | null {
    return [...this.documents.values()].find((document) =>
      document.studentId === input.studentId
      && document.resourceId === input.resourceId
      && document.extractionStrategyVersion === input.extractionStrategyVersion
      && document.chunkingStrategyVersion === input.chunkingStrategyVersion,
    ) ?? null;
  }

  public createResourceExtractedContentBlocks(
    input: readonly CreateResourceExtractedContentBlockInput[],
  ): Promise<readonly DbResourceExtractedContentBlockRecord[]> {
    return this.createResourceExtractedContentBlocksCheckpoint(input);
  }

  public createResourceExtractedContentBlocksCheckpoint(
    input: readonly CreateResourceExtractedContentBlockInput[],
  ): Promise<readonly DbResourceExtractedContentBlockRecord[]> {
    for (const block of input) {
      if (this.blocks.has(block.blockId)) {
        continue;
      }

      this.blocks.set(block.blockId, {
        ...block,
        createdAt: now(),
        updatedAt: now(),
      });
    }

    return Promise.resolve(input.map((block) => {
      const persisted = this.blocks.get(block.blockId);

      if (persisted === undefined) {
        throw new Error(`Expected persisted block ${block.blockId}.`);
      }

      return persisted;
    }));
  }

  public createResourceExtractionProvenance(
    input: CreateResourceExtractionProvenanceInput,
  ): Promise<DbResourceExtractionProvenanceRecord> {
    return this.createResourceExtractionProvenanceCheckpoint(input);
  }

  public createResourceExtractionProvenanceCheckpoint(
    input: CreateResourceExtractionProvenanceInput,
  ): Promise<DbResourceExtractionProvenanceRecord> {
    const existing = this.provenance.get(input.provenanceId);

    if (existing !== undefined) {
      return Promise.resolve(existing);
    }

    const record = {
      ...input,
      createdAt: now(),
    } satisfies DbResourceExtractionProvenanceRecord;

    this.provenance.set(record.provenanceId, record);

    return Promise.resolve(record);
  }

  public createResourceExtractedPages(
    input: readonly CreateResourceExtractedPageInput[],
  ): Promise<readonly DbResourceExtractedPageRecord[]> {
    return this.createResourceExtractedPagesCheckpoint(input);
  }

  public createResourceExtractedPagesCheckpoint(
    input: readonly CreateResourceExtractedPageInput[],
  ): Promise<readonly DbResourceExtractedPageRecord[]> {
    for (const page of input) {
      const pageKey = `${page.studentId}:${page.extractionDocumentId}:${page.pageNumber}`;

      if (this.pages.has(pageKey)) {
        continue;
      }

      this.pages.set(pageKey, {
        ...page,
        createdAt: now(),
        updatedAt: now(),
      });
    }

    return Promise.resolve(input.map((page) => {
      const pageKey = `${page.studentId}:${page.extractionDocumentId}:${page.pageNumber}`;
      const persisted = this.pages.get(pageKey);

      if (persisted === undefined) {
        throw new Error(`Expected persisted page ${page.pageNumber}.`);
      }

      return persisted;
    }));
  }

  public createResourceExtractionFailures(
    input: readonly CreateResourceExtractionFailureInput[],
  ): Promise<readonly DbResourceExtractionFailureRecord[]> {
    return this.createResourceExtractionFailuresCheckpoint(input);
  }

  public createResourceExtractionFailuresCheckpoint(
    input: readonly CreateResourceExtractionFailureInput[],
  ): Promise<readonly DbResourceExtractionFailureRecord[]> {
    for (const failure of input) {
      if (this.failures.has(failure.failureId)) {
        continue;
      }

      this.failures.set(failure.failureId, {
        ...failure,
        createdAt: now(),
      });
    }

    return Promise.resolve(input.map((failure) => {
      const persisted = this.failures.get(failure.failureId);

      if (persisted === undefined) {
        throw new Error(`Expected persisted failure ${failure.failureId}.`);
      }

      return persisted;
    }));
  }

  public async createResourceExtractionDocumentWithBlocks(
    input: CreateResourceExtractionDocumentWithBlocksInput,
  ): Promise<DbResourceExtractionDocumentWithBlocks> {
    const document = await this.createResourceExtractionDocumentCheckpoint(
      input.document,
    );
    const blocks = await this.createResourceExtractedContentBlocksCheckpoint(
      input.blocks,
    );

    return {
      document,
      blocks,
    };
  }

  public getResourceExtractionDocumentById(
    input: Readonly<{
      studentId: StudentId;
      extractionDocumentId: DbResourceExtractionDocumentId;
    }>,
  ): Promise<DbResourceExtractionDocumentRecord | null> {
    const document = this.documents.get(input.extractionDocumentId);

    if (document === undefined || document.studentId !== input.studentId) {
      return Promise.resolve(null);
    }

    return Promise.resolve(document);
  }

  public listResourceExtractionDocumentsByResource(
    input: Readonly<{
      studentId: StudentId;
      resourceId: ResourceId;
    }>,
  ): Promise<readonly DbResourceExtractionDocumentRecord[]> {
    return Promise.resolve(
      this.listResourceExtractionDocumentsByResourceSync(input),
    );
  }

  public listResourceExtractionDocumentsByResourceSync(
    input: Readonly<{
      studentId: StudentId;
      resourceId: ResourceId;
    }>,
  ): readonly DbResourceExtractionDocumentRecord[] {
    return [...this.documents.values()]
      .filter((document) =>
        document.studentId === input.studentId
        && document.resourceId === input.resourceId,
      )
      .sort((left, right) =>
        right.extractedAt.localeCompare(left.extractedAt),
      );
  }

  public listResourceExtractedContentBlocks(
    input: Readonly<{
      studentId: StudentId;
      extractionDocumentId: DbResourceExtractionDocumentId;
    }>,
  ): Promise<readonly DbResourceExtractedContentBlockRecord[]> {
    return Promise.resolve(
      this.listBlocks(input.extractionDocumentId)
        .filter((block) => block.studentId === input.studentId),
    );
  }

  public listResourceExtractionProvenance(
    input: Readonly<{
      studentId: StudentId;
      extractionDocumentId: DbResourceExtractionDocumentId;
    }>,
  ): Promise<readonly DbResourceExtractionProvenanceRecord[]> {
    return Promise.resolve(
      this.listProvenance(input.extractionDocumentId)
        .filter((record) => record.studentId === input.studentId),
    );
  }

  public listResourceExtractedPages(
    input: Readonly<{
      studentId: StudentId;
      extractionDocumentId: DbResourceExtractionDocumentId;
    }>,
  ): Promise<readonly DbResourceExtractedPageRecord[]> {
    return Promise.resolve(
      this.listPages(input.extractionDocumentId)
        .filter((page) => page.studentId === input.studentId),
    );
  }

  public listResourceExtractionFailures(
    input: Readonly<{
      studentId: StudentId;
      extractionDocumentId: DbResourceExtractionDocumentId;
    }>,
  ): Promise<readonly DbResourceExtractionFailureRecord[]> {
    return Promise.resolve(
      this.listFailures(input.extractionDocumentId)
        .filter((failure) => failure.studentId === input.studentId),
    );
  }

  public getResourceExtractionDocumentTree(
    input: Readonly<{
      studentId: StudentId;
      extractionDocumentId: DbResourceExtractionDocumentId;
    }>,
  ): Promise<DbResourceExtractionDocumentTree | null> {
    const document = this.documents.get(input.extractionDocumentId);

    if (document === undefined || document.studentId !== input.studentId) {
      return Promise.resolve(null);
    }

    const blocks = this.listBlocks(input.extractionDocumentId);
    const nodesById = new Map<
      DbResourceExtractedContentBlockId,
      DbResourceExtractedContentBlockNode
    >();

    for (const block of blocks) {
      nodesById.set(block.blockId, {
        block,
        children: [],
      });
    }

    const roots: DbResourceExtractedContentBlockNode[] = [];

    for (const block of blocks) {
      const node = nodesById.get(block.blockId);

      if (node === undefined) {
        throw new Error(`Expected block node ${block.blockId}.`);
      }

      if (block.parentBlockId === null) {
        roots.push(node);
        continue;
      }

      const parent = nodesById.get(block.parentBlockId);

      if (parent === undefined) {
        roots.push(node);
        continue;
      }

      (parent.children as DbResourceExtractedContentBlockNode[]).push(node);
    }

    return Promise.resolve({
      document,
      blocks: roots,
    });
  }
}

function assertEqual<TValue>(actual: TValue, expected: TValue, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${String(expected)} but received ${String(actual)}`);
  }
}

function assertNotNull<TValue>(
  actual: TValue | null,
  label: string,
): asserts actual is TValue {
  if (actual === null) {
    throw new Error(`${label}: expected non-null value.`);
  }
}

function assertNonEmpty(value: string, label: string): void {
  if (value.trim().length === 0) {
    throw new Error(`Expected non-empty ${label}.`);
  }
}

function now(): IsoDateTimeString {
  return "2026-08-19T18:10:00.000Z" as IsoDateTimeString;
}