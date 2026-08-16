import type {
  ResourceExtractionRequest,
  ResourceExtractionService,
} from "@avora/domain/resources";
import type {
  CreateResourceExtractedContentBlockInput,
  CreateResourceExtractedPageInput,
  CreateResourceExtractionFailureInput,
  CreateResourceExtractionProvenanceInput,
  DbResourceExtractionDocumentRecord,
  DbResourceExtractionFailureRecord,
  ResourceExtractionRepository,
} from "@avora/db/repositories/extraction";
import type {
  ResourceId,
  StudentId,
} from "@avora/core/identity";
import type {
  ResourcesRepository,
} from "@avora/db/repositories/resources";
import {
  resourceExtractionJobName,
} from "@avora/jobs/resource-extraction";

import type {
  HandleResourceExtractionJobInput,
  ResourceExtractionWorkerHandledOutcome,
  ResourceExtractionWorkerHandledResult,
} from "./contracts.js";
import {
  resourceExtractionWorkerHandlerName,
} from "./contracts.js";
import {
  ResourceExtractionWorkerHandlerError,
} from "./errors.js";
import {
  mapDbResourceExtractionFailureToDomainFailure,
  mapExtractedResourceContentBlocksToCreateInputs,
  mapExtractedResourceContentDocumentProvenanceToCreateInput,
  mapExtractedResourceContentFailuresToCreateInputs,
  mapExtractedResourceContentPageProvenanceToCreateInputs,
  mapExtractedResourceContentPagesToCreateInputs,
  mapFailedResourceExtractionRequestToDocumentCreateInput,
  mapResourceExtractionDocumentToCreateInput,
  mapResourceExtractionFailureToCreateInput,
  mapResourceExtractionJobPayloadToRequest,
  mapResourceExtractionRequestToCheckpointLookupInput,
} from "./mapper.js";

export type ResourceExtractionWorkerHandler = Readonly<{
  handleResourceExtractionJob: (
    input: HandleResourceExtractionJobInput,
  ) => Promise<ResourceExtractionWorkerHandledResult>;
}>;

export type CreateResourceExtractionWorkerHandlerInput = Readonly<{
  extractionService: ResourceExtractionService;
  extractionRepository: ResourceExtractionRepository;
  resourcesRepository: ResourcesRepository;
}>;

type ExistingCheckpointUsability =
  | Readonly<{
      usable: false;
    }>
  | Readonly<{
      usable: true;
      outcome: ResourceExtractionWorkerHandledOutcome;
      document: DbResourceExtractionDocumentRecord;
      persistedBlockCount: number;
      failure: DbResourceExtractionFailureRecord | null;
    }>;

export function createResourceExtractionWorkerHandler(
  input: CreateResourceExtractionWorkerHandlerInput,
): ResourceExtractionWorkerHandler {
  return {
    handleResourceExtractionJob: async (
      handleInput: HandleResourceExtractionJobInput,
    ): Promise<ResourceExtractionWorkerHandledResult> => {
      assertResourceExtractionJob(handleInput);

      const extractionRequest = mapResourceExtractionJobPayloadToRequest(
        handleInput.job.payload,
      );

      const existingBeforeProcessing = await getExistingUsableCheckpoint({
        extractionRepository: input.extractionRepository,
        request: extractionRequest,
      });

      if (existingBeforeProcessing.usable) {
        await convergeResourceLifecycle({
          resourcesRepository: input.resourcesRepository,
          studentId: handleInput.job.payload.studentId,
          resourceId: handleInput.job.payload.resourceId,
          outcome: existingBeforeProcessing.outcome,
          failureMessage: existingBeforeProcessing.failure?.message ?? null,
        });

        return mapExistingCheckpointToHandledResult({
          jobName: handleInput.job.name,
          studentId: handleInput.job.payload.studentId,
          resourceId: handleInput.job.payload.resourceId,
          existing: existingBeforeProcessing,
        });
      }

      const processingTransition = await tryMarkResourceProcessing({
        resourcesRepository: input.resourcesRepository,
        studentId: handleInput.job.payload.studentId,
        resourceId: handleInput.job.payload.resourceId,
      });

      if (!processingTransition.transitioned) {
        const existingAfterFailedProcessingTransition =
          await getExistingUsableCheckpoint({
            extractionRepository: input.extractionRepository,
            request: extractionRequest,
          });

        if (existingAfterFailedProcessingTransition.usable) {
          await convergeResourceLifecycle({
            resourcesRepository: input.resourcesRepository,
            studentId: handleInput.job.payload.studentId,
            resourceId: handleInput.job.payload.resourceId,
            outcome: existingAfterFailedProcessingTransition.outcome,
            failureMessage:
              existingAfterFailedProcessingTransition.failure?.message ?? null,
          });

          return mapExistingCheckpointToHandledResult({
            jobName: handleInput.job.name,
            studentId: handleInput.job.payload.studentId,
            resourceId: handleInput.job.payload.resourceId,
            existing: existingAfterFailedProcessingTransition,
          });
        }

        throw new ResourceExtractionWorkerHandlerError(
          "resource_extraction_worker_lifecycle_failed",
          processingTransition.errorMessage,
        );
      }

      const existingAfterProcessing = await getExistingUsableCheckpoint({
        extractionRepository: input.extractionRepository,
        request: extractionRequest,
      });

      if (existingAfterProcessing.usable) {
        await convergeResourceLifecycle({
          resourcesRepository: input.resourcesRepository,
          studentId: handleInput.job.payload.studentId,
          resourceId: handleInput.job.payload.resourceId,
          outcome: existingAfterProcessing.outcome,
          failureMessage: existingAfterProcessing.failure?.message ?? null,
        });

        return mapExistingCheckpointToHandledResult({
          jobName: handleInput.job.name,
          studentId: handleInput.job.payload.studentId,
          resourceId: handleInput.job.payload.resourceId,
          existing: existingAfterProcessing,
        });
      }

      const extractionResult = await input.extractionService.extractResource(
        extractionRequest,
      );

      if (extractionResult.outcome === "failed") {
        const document = await persistExtractionDocument({
          extractionRepository: input.extractionRepository,
          document: mapFailedResourceExtractionRequestToDocumentCreateInput({
            request: extractionRequest,
            extractedAt: handleInput.job.payload.requestedAt,
          }),
        });

        const persistedFailures = await persistExtractionFailures({
          extractionRepository: input.extractionRepository,
          failures: [
            mapResourceExtractionFailureToCreateInput({
              request: extractionRequest,
              failure: extractionResult.failure,
              provenanceId: null,
              pageNumber: null,
            }),
          ],
        });

        await markResourceFailed({
          resourcesRepository: input.resourcesRepository,
          studentId: handleInput.job.payload.studentId,
          resourceId: handleInput.job.payload.resourceId,
          reason: extractionResult.failure.message,
        });

        return {
          handlerName: resourceExtractionWorkerHandlerName,
          jobName: handleInput.job.name,
          studentId: handleInput.job.payload.studentId,
          resourceId: handleInput.job.payload.resourceId,
          outcome: "failed",
          extractionDocumentId: document.extractionDocumentId,
          persistedBlockCount: 0,
          failure:
            persistedFailures[0] === undefined
              ? extractionResult.failure
              : mapDbResourceExtractionFailureToDomainFailure(
                persistedFailures[0],
              ),
        };
      }

      const document = await persistExtractionDocument({
        extractionRepository: input.extractionRepository,
        document: mapResourceExtractionDocumentToCreateInput(
          extractionResult.document,
        ),
      });

      await persistExtractionProvenance({
        extractionRepository: input.extractionRepository,
        provenance: mapExtractedResourceContentPageProvenanceToCreateInputs(
          extractionResult.content,
        ),
      });

      await persistExtractionPages({
        extractionRepository: input.extractionRepository,
        pages: mapExtractedResourceContentPagesToCreateInputs(
          extractionResult.content,
        ),
      });

      const blocks = await persistExtractionBlocks({
        extractionRepository: input.extractionRepository,
        blocks: mapExtractedResourceContentBlocksToCreateInputs(
          extractionResult.content,
        ),
      });

      const failures = await persistExtractionFailures({
        extractionRepository: input.extractionRepository,
        failures: mapExtractedResourceContentFailuresToCreateInputs({
          request: extractionRequest,
          content: extractionResult.content,
          warning:
            extractionResult.outcome === "partially_extracted"
              ? extractionResult.warning
              : null,
        }),
      });

      await persistExtractionProvenance({
        extractionRepository: input.extractionRepository,
        provenance: [
          mapExtractedResourceContentDocumentProvenanceToCreateInput(
            extractionResult.content,
          ),
        ],
      });

      await markResourceReady({
        resourcesRepository: input.resourcesRepository,
        studentId: handleInput.job.payload.studentId,
        resourceId: handleInput.job.payload.resourceId,
      });

      return {
        handlerName: resourceExtractionWorkerHandlerName,
        jobName: handleInput.job.name,
        studentId: handleInput.job.payload.studentId,
        resourceId: handleInput.job.payload.resourceId,
        outcome: extractionResult.outcome,
        extractionDocumentId: document.extractionDocumentId,
        persistedBlockCount: blocks.length,
        failure:
          extractionResult.outcome === "partially_extracted"
            ? (
              failures[0] === undefined
                ? extractionResult.warning
                : mapDbResourceExtractionFailureToDomainFailure(failures[0])
            )
            : null,
      };
    },
  };
}

async function getExistingUsableCheckpoint(
  input: Readonly<{
    extractionRepository: ResourceExtractionRepository;
    request: ResourceExtractionRequest;
  }>,
): Promise<ExistingCheckpointUsability> {
  const document = await readExistingCheckpoint(input);

  if (document === null) {
    return {
      usable: false,
    };
  }

  if (document.status === "failed") {
    return getExistingFailedCheckpointFromDocument({
      extractionRepository: input.extractionRepository,
      document,
    });
  }

  const provenance = await readExtractionProvenance({
    extractionRepository: input.extractionRepository,
    studentId: document.studentId,
    extractionDocumentId: document.extractionDocumentId,
  });

  const hasDocumentProvenance = provenance.some((record) =>
    record.pageNumber === null,
  );

  if (!hasDocumentProvenance) {
    return {
      usable: false,
    };
  }

  const blocks = await readExtractionBlocks({
    extractionRepository: input.extractionRepository,
    studentId: document.studentId,
    extractionDocumentId: document.extractionDocumentId,
  });

  if (document.status === "partially_extracted") {
    const failures = await readExtractionFailures({
      extractionRepository: input.extractionRepository,
      studentId: document.studentId,
      extractionDocumentId: document.extractionDocumentId,
    });

    const failure = failures[0];

    if (failure === undefined) {
      return {
        usable: false,
      };
    }

    return {
      usable: true,
      outcome: "partially_extracted",
      document,
      persistedBlockCount: blocks.length,
      failure,
    };
  }

  return {
    usable: true,
    outcome: "extracted",
    document,
    persistedBlockCount: blocks.length,
    failure: null,
  };
}

async function getExistingFailedCheckpointFromDocument(
  input: Readonly<{
    extractionRepository: ResourceExtractionRepository;
    document: DbResourceExtractionDocumentRecord;
  }>,
): Promise<ExistingCheckpointUsability> {
  const failures = await readExtractionFailures({
    extractionRepository: input.extractionRepository,
    studentId: input.document.studentId,
    extractionDocumentId: input.document.extractionDocumentId,
  });

  const failure = failures[0];

  if (failure === undefined) {
    return {
      usable: false,
    };
  }

  return {
    usable: true,
    outcome: "failed",
    document: input.document,
    persistedBlockCount: 0,
    failure,
  };
}

async function readExistingCheckpoint(
  input: Readonly<{
    extractionRepository: ResourceExtractionRepository;
    request: ResourceExtractionRequest;
  }>,
): Promise<DbResourceExtractionDocumentRecord | null> {
  try {
    return await input.extractionRepository.getResourceExtractionDocumentCheckpoint(
      mapResourceExtractionRequestToCheckpointLookupInput(input.request),
    );
  } catch (error) {
    throw new ResourceExtractionWorkerHandlerError(
      "resource_extraction_worker_checkpoint_failed",
      getErrorMessage(
        error,
        "Resource extraction worker failed while reading extraction document checkpoint.",
      ),
    );
  }
}

async function readExtractionBlocks(
  input: Readonly<{
    extractionRepository: ResourceExtractionRepository;
    studentId: StudentId;
    extractionDocumentId: DbResourceExtractionDocumentRecord["extractionDocumentId"];
  }>,
) {
  try {
    return await input.extractionRepository.listResourceExtractedContentBlocks({
      studentId: input.studentId,
      extractionDocumentId: input.extractionDocumentId,
    });
  } catch (error) {
    throw new ResourceExtractionWorkerHandlerError(
      "resource_extraction_worker_checkpoint_failed",
      getErrorMessage(
        error,
        "Resource extraction worker failed while reading extracted content blocks.",
      ),
    );
  }
}

async function readExtractionProvenance(
  input: Readonly<{
    extractionRepository: ResourceExtractionRepository;
    studentId: StudentId;
    extractionDocumentId: DbResourceExtractionDocumentRecord["extractionDocumentId"];
  }>,
) {
  try {
    return await input.extractionRepository.listResourceExtractionProvenance({
      studentId: input.studentId,
      extractionDocumentId: input.extractionDocumentId,
    });
  } catch (error) {
    throw new ResourceExtractionWorkerHandlerError(
      "resource_extraction_worker_checkpoint_failed",
      getErrorMessage(
        error,
        "Resource extraction worker failed while reading extraction provenance.",
      ),
    );
  }
}

async function readExtractionFailures(
  input: Readonly<{
    extractionRepository: ResourceExtractionRepository;
    studentId: StudentId;
    extractionDocumentId: DbResourceExtractionDocumentRecord["extractionDocumentId"];
  }>,
) {
  try {
    return await input.extractionRepository.listResourceExtractionFailures({
      studentId: input.studentId,
      extractionDocumentId: input.extractionDocumentId,
    });
  } catch (error) {
    throw new ResourceExtractionWorkerHandlerError(
      "resource_extraction_worker_checkpoint_failed",
      getErrorMessage(
        error,
        "Resource extraction worker failed while reading extraction failures.",
      ),
    );
  }
}

async function persistExtractionDocument(
  input: Readonly<{
    extractionRepository: ResourceExtractionRepository;
    document: Parameters<
      ResourceExtractionRepository["createResourceExtractionDocumentCheckpoint"]
    >[0];
  }>,
): Promise<DbResourceExtractionDocumentRecord> {
  try {
    return await input.extractionRepository
      .createResourceExtractionDocumentCheckpoint(input.document);
  } catch (error) {
    throw new ResourceExtractionWorkerHandlerError(
      "resource_extraction_worker_persistence_failed",
      getErrorMessage(
        error,
        "Resource extraction worker failed while persisting extraction document.",
      ),
    );
  }
}

async function persistExtractionProvenance(
  input: Readonly<{
    extractionRepository: ResourceExtractionRepository;
    provenance: readonly CreateResourceExtractionProvenanceInput[];
  }>,
): Promise<void> {
  try {
    for (const provenance of input.provenance) {
      await input.extractionRepository
        .createResourceExtractionProvenanceCheckpoint(provenance);
    }
  } catch (error) {
    throw new ResourceExtractionWorkerHandlerError(
      "resource_extraction_worker_persistence_failed",
      getErrorMessage(
        error,
        "Resource extraction worker failed while persisting extraction provenance.",
      ),
    );
  }
}

async function persistExtractionPages(
  input: Readonly<{
    extractionRepository: ResourceExtractionRepository;
    pages: readonly CreateResourceExtractedPageInput[];
  }>,
): Promise<void> {
  try {
    await input.extractionRepository
      .createResourceExtractedPagesCheckpoint(input.pages);
  } catch (error) {
    throw new ResourceExtractionWorkerHandlerError(
      "resource_extraction_worker_persistence_failed",
      getErrorMessage(
        error,
        "Resource extraction worker failed while persisting extracted pages.",
      ),
    );
  }
}

async function persistExtractionBlocks(
  input: Readonly<{
    extractionRepository: ResourceExtractionRepository;
    blocks: readonly CreateResourceExtractedContentBlockInput[];
  }>,
): Promise<readonly unknown[]> {
  try {
    return await input.extractionRepository
      .createResourceExtractedContentBlocksCheckpoint(input.blocks);
  } catch (error) {
    throw new ResourceExtractionWorkerHandlerError(
      "resource_extraction_worker_persistence_failed",
      getErrorMessage(
        error,
        "Resource extraction worker failed while persisting extracted content blocks.",
      ),
    );
  }
}

async function persistExtractionFailures(
  input: Readonly<{
    extractionRepository: ResourceExtractionRepository;
    failures: readonly CreateResourceExtractionFailureInput[];
  }>,
): Promise<readonly DbResourceExtractionFailureRecord[]> {
  try {
    return await input.extractionRepository
      .createResourceExtractionFailuresCheckpoint(input.failures);
  } catch (error) {
    throw new ResourceExtractionWorkerHandlerError(
      "resource_extraction_worker_persistence_failed",
      getErrorMessage(
        error,
        "Resource extraction worker failed while persisting extraction failures.",
      ),
    );
  }
}

async function tryMarkResourceProcessing(
  input: Readonly<{
    resourcesRepository: ResourcesRepository;
    studentId: StudentId;
    resourceId: ResourceId;
  }>,
): Promise<
  | Readonly<{ transitioned: true }>
  | Readonly<{ transitioned: false; errorMessage: string }>
> {
  try {
    await input.resourcesRepository.markResourceProcessing({
      studentId: input.studentId,
      resourceId: input.resourceId,
    });

    return {
      transitioned: true,
    };
  } catch (error) {
    return {
      transitioned: false,
      errorMessage: getErrorMessage(
        error,
        "Resource extraction worker failed while marking resource processing.",
      ),
    };
  }
}

async function markResourceReady(
  input: Readonly<{
    resourcesRepository: ResourcesRepository;
    studentId: StudentId;
    resourceId: ResourceId;
  }>,
): Promise<void> {
  try {
    await input.resourcesRepository.markResourceReady({
      studentId: input.studentId,
      resourceId: input.resourceId,
    });
  } catch (error) {
    throw new ResourceExtractionWorkerHandlerError(
      "resource_extraction_worker_lifecycle_failed",
      getErrorMessage(
        error,
        "Resource extraction worker failed while marking resource ready.",
      ),
    );
  }
}

async function markResourceFailed(
  input: Readonly<{
    resourcesRepository: ResourcesRepository;
    studentId: StudentId;
    resourceId: ResourceId;
    reason: string;
  }>,
): Promise<void> {
  try {
    await input.resourcesRepository.markResourceFailed({
      studentId: input.studentId,
      resourceId: input.resourceId,
      reason: input.reason,
    });
  } catch (error) {
    throw new ResourceExtractionWorkerHandlerError(
      "resource_extraction_worker_lifecycle_failed",
      getErrorMessage(
        error,
        "Resource extraction worker failed while marking resource failed.",
      ),
    );
  }
}

async function convergeResourceLifecycle(
  input: Readonly<{
    resourcesRepository: ResourcesRepository;
    studentId: StudentId;
    resourceId: ResourceId;
    outcome: ResourceExtractionWorkerHandledOutcome;
    failureMessage: string | null;
  }>,
): Promise<void> {
  if (input.outcome === "failed") {
    await markResourceFailed({
      resourcesRepository: input.resourcesRepository,
      studentId: input.studentId,
      resourceId: input.resourceId,
      reason: input.failureMessage ?? "Resource extraction failed.",
    });

    return;
  }

  await markResourceReady({
    resourcesRepository: input.resourcesRepository,
    studentId: input.studentId,
    resourceId: input.resourceId,
  });
}

function mapExistingCheckpointToHandledResult(
  input: Readonly<{
    jobName: ResourceExtractionWorkerHandledResult["jobName"];
    studentId: ResourceExtractionWorkerHandledResult["studentId"];
    resourceId: ResourceExtractionWorkerHandledResult["resourceId"];
    existing: Extract<ExistingCheckpointUsability, { usable: true }>;
  }>,
): ResourceExtractionWorkerHandledResult {
  return {
    handlerName: resourceExtractionWorkerHandlerName,
    jobName: input.jobName,
    studentId: input.studentId,
    resourceId: input.resourceId,
    outcome: input.existing.outcome,
    extractionDocumentId: input.existing.document.extractionDocumentId,
    persistedBlockCount: input.existing.persistedBlockCount,
    failure:
      input.existing.failure === null
        ? null
        : mapDbResourceExtractionFailureToDomainFailure(input.existing.failure),
  };
}

function assertResourceExtractionJob(
  input: HandleResourceExtractionJobInput,
): void {
  if (input.job.name !== resourceExtractionJobName) {
    throw new ResourceExtractionWorkerHandlerError(
      "resource_extraction_worker_invalid_job",
      "Resource extraction worker received an unsupported job name.",
    );
  }

  assertNonEmpty(
    input.job.payload.extractionDocumentId,
    "Resource extraction job extraction document id is required.",
  );

  assertNonEmpty(
    input.job.payload.storage.objectPath,
    "Resource extraction job storage object path is required.",
  );

  assertNonEmpty(
    input.job.payload.declaredMimeType,
    "Resource extraction job declared MIME type is required.",
  );

  assertNonEmpty(
    input.job.payload.contentHash,
    "Resource extraction job content hash is required.",
  );

  assertNonEmpty(
    input.job.payload.extractionStrategyVersion,
    "Resource extraction job extraction strategy version is required.",
  );

  assertNonEmpty(
    input.job.payload.chunkingStrategyVersion,
    "Resource extraction job chunking strategy version is required.",
  );

  assertNonEmpty(
    input.job.payload.requestedAt,
    "Resource extraction job requested-at timestamp is required.",
  );

  if (
    !Number.isSafeInteger(input.job.payload.byteSize)
    || input.job.payload.byteSize < 0
  ) {
    throw new ResourceExtractionWorkerHandlerError(
      "resource_extraction_worker_invalid_job",
      "Resource extraction job byte size must be a non-negative integer.",
    );
  }
}

function assertNonEmpty(value: string, message: string): void {
  if (value.trim().length === 0) {
    throw new ResourceExtractionWorkerHandlerError(
      "resource_extraction_worker_invalid_job",
      message,
    );
  }
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
}