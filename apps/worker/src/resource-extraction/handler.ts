import type {
  ResourceExtractionService,
} from "@avora/domain/resources";
import type {
  ResourceExtractionRepository,
} from "@avora/db/repositories/extraction";
import {
  resourceExtractionJobName,
} from "@avora/jobs/resource-extraction";

import type {
  HandleResourceExtractionJobInput,
  ResourceExtractionWorkerHandledResult,
} from "./contracts.js";
import {
  resourceExtractionWorkerHandlerName,
} from "./contracts.js";
import {
  ResourceExtractionWorkerHandlerError,
} from "./errors.js";
import {
  mapResourceExtractionDocumentBlocksToCreateInputs,
  mapResourceExtractionDocumentToCreateInput,
  mapResourceExtractionJobPayloadToRequest,
} from "./mapper.js";

export type ResourceExtractionWorkerHandler = Readonly<{
  handleResourceExtractionJob: (
    input: HandleResourceExtractionJobInput,
  ) => Promise<ResourceExtractionWorkerHandledResult>;
}>;

export type CreateResourceExtractionWorkerHandlerInput = Readonly<{
  extractionService: ResourceExtractionService;
  extractionRepository: ResourceExtractionRepository;
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

      const extractionResult = await input.extractionService.extractResource(
        extractionRequest,
      );

      if (extractionResult.outcome === "failed") {
        return {
          handlerName: resourceExtractionWorkerHandlerName,
          jobName: handleInput.job.name,
          studentId: handleInput.job.payload.studentId,
          resourceId: handleInput.job.payload.resourceId,
          outcome: "failed",
          extractionDocumentId: null,
          persistedBlockCount: 0,
          failure: extractionResult.failure,
        };
      }

      try {
        const persisted = await input.extractionRepository
          .createResourceExtractionDocumentWithBlocks({
            document: mapResourceExtractionDocumentToCreateInput(
              extractionResult.document,
            ),
            blocks: mapResourceExtractionDocumentBlocksToCreateInputs(
              extractionResult.document,
            ),
          });

        return {
          handlerName: resourceExtractionWorkerHandlerName,
          jobName: handleInput.job.name,
          studentId: handleInput.job.payload.studentId,
          resourceId: handleInput.job.payload.resourceId,
          outcome: extractionResult.outcome,
          extractionDocumentId: persisted.document.extractionDocumentId,
          persistedBlockCount: persisted.blocks.length,
          failure:
            extractionResult.outcome === "partially_extracted"
              ? extractionResult.warning
              : null,
        };
      } catch (error) {
        if (error instanceof Error) {
          throw new ResourceExtractionWorkerHandlerError(
            "resource_extraction_worker_persistence_failed",
            error.message,
          );
        }

        throw new ResourceExtractionWorkerHandlerError(
          "resource_extraction_worker_unexpected_failure",
          "Resource extraction worker failed while persisting extraction output.",
        );
      }
    },
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