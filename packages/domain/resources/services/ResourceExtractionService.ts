import type {
  ResourceExtractionDocument,
  ResourceExtractionFailure,
  ResourceExtractionRequest,
  ResourceExtractionResult,
} from "../contracts/index.js";
import type {
  ResourceExtractionPort,
} from "../ports/index.js";

export type ResourceExtractionService = Readonly<{
  extractResource: (
    input: ResourceExtractionRequest,
  ) => Promise<ResourceExtractionResult>;
}>;

export type ResourceExtractionServiceDependencies = Readonly<{
  extractor: ResourceExtractionPort;
}>;

export type ResourceExtractionServiceErrorCode =
  | "resource_extraction_invalid_request"
  | "resource_extraction_inconsistent_result"
  | "resource_extraction_port_failed";

export class ResourceExtractionServiceError extends Error {
  public readonly code: ResourceExtractionServiceErrorCode;

  public constructor(code: ResourceExtractionServiceErrorCode, message: string) {
    super(message);
    this.name = "ResourceExtractionServiceError";
    this.code = code;
  }
}

export function createResourceExtractionService(
  dependencies: ResourceExtractionServiceDependencies,
): ResourceExtractionService {
  return {
    extractResource: async (
      input: ResourceExtractionRequest,
    ): Promise<ResourceExtractionResult> => {
      assertValidExtractionRequest(input);

      try {
        const result = await dependencies.extractor.extractResourceContent(input);

        assertConsistentExtractionResult(input, result);

        return result;
      } catch (error) {
        if (error instanceof ResourceExtractionServiceError) {
          throw error;
        }

        throw new ResourceExtractionServiceError(
          "resource_extraction_port_failed",
          "Resource extraction port failed before returning an extraction result.",
        );
      }
    },
  };
}

function assertValidExtractionRequest(input: ResourceExtractionRequest): void {
  assertNonEmptyString(
    input.declaredMimeType,
    "Resource extraction requires a declared MIME type.",
  );

  assertNonEmptyString(
    input.contentHash,
    "Resource extraction requires a content hash.",
  );

  assertNonEmptyString(
    input.extractionStrategyVersion,
    "Resource extraction requires an extraction strategy version.",
  );

  assertNonEmptyString(
    input.chunkingStrategyVersion,
    "Resource extraction requires a chunking strategy version.",
  );
}

function assertConsistentExtractionResult(
  input: ResourceExtractionRequest,
  result: ResourceExtractionResult,
): void {
  if (result.outcome === "failed") {
    assertValidFailure(result.failure);
    return;
  }

  assertDocumentMatchesRequest(input, result.document);

  if (result.outcome === "extracted") {
    if (result.document.status !== "extracted") {
      throwInconsistentResult(
        "An extracted result must return a document with extracted status.",
      );
    }

    return;
  }

  if (result.document.status !== "partially_extracted") {
    throwInconsistentResult(
      "A partially extracted result must return a document with partially_extracted status.",
    );
  }

  assertValidFailure(result.warning);
}

function assertDocumentMatchesRequest(
  input: ResourceExtractionRequest,
  document: ResourceExtractionDocument,
): void {
  if (document.studentId !== input.studentId) {
    throwInconsistentResult(
      "Resource extraction document student does not match the extraction request.",
    );
  }

  if (document.resourceId !== input.resourceId) {
    throwInconsistentResult(
      "Resource extraction document resource does not match the extraction request.",
    );
  }

  if (document.extractionStrategyVersion !== input.extractionStrategyVersion) {
    throwInconsistentResult(
      "Resource extraction document strategy version does not match the extraction request.",
    );
  }

  if (document.chunkingStrategyVersion !== input.chunkingStrategyVersion) {
    throwInconsistentResult(
      "Resource extraction document chunking version does not match the extraction request.",
    );
  }

  for (const block of document.blocks) {
    if (block.text.trim().length === 0) {
      throwInconsistentResult(
        "Resource extraction document contains an empty extracted content block.",
      );
    }

    if (!Number.isSafeInteger(block.sortOrder) || block.sortOrder < 0) {
      throwInconsistentResult(
        "Resource extraction document contains an invalid extracted content block sort order.",
      );
    }

    if (
      block.confidence !== null
      && (
        !Number.isFinite(block.confidence)
        || block.confidence < 0
        || block.confidence > 1
      )
    ) {
      throwInconsistentResult(
        "Resource extraction document contains an invalid extracted content block confidence.",
      );
    }

    if (
      block.parentBlockId !== null
      && block.parentBlockId === block.blockId
    ) {
      throwInconsistentResult(
        "Resource extraction document contains a block that references itself as its parent.",
      );
    }
  }
}

function assertValidFailure(failure: ResourceExtractionFailure): void {
  assertNonEmptyString(
    failure.message,
    "Resource extraction failure requires a message.",
  );
}

function assertNonEmptyString(value: string, message: string): void {
  if (value.trim().length === 0) {
    throw new ResourceExtractionServiceError(
      "resource_extraction_invalid_request",
      message,
    );
  }
}

function throwInconsistentResult(message: string): never {
  throw new ResourceExtractionServiceError(
    "resource_extraction_inconsistent_result",
    message,
  );
}