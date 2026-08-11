import type {
  CreateResourceExtractionJobEnvelopeInput,
  ResourceExtractionJobRequest,
} from "./contracts.js";
import {
  resourceExtractionJobName,
} from "./contracts.js";

export function createResourceExtractionJobEnvelope(
  input: CreateResourceExtractionJobEnvelopeInput,
): ResourceExtractionJobRequest {
  assertValidResourceExtractionPayload(input.payload);

  return {
    name: resourceExtractionJobName,
    reason: input.reason,
    priority: input.priority,
    payload: input.payload,
  };
}

function assertValidResourceExtractionPayload(
  payload: CreateResourceExtractionJobEnvelopeInput["payload"],
): void {
  assertNonEmpty(payload.storage.objectPath, "Resource extraction storage object path is required.");
  assertNonEmpty(payload.declaredMimeType, "Resource extraction declared MIME type is required.");
  assertNonEmpty(payload.contentHash, "Resource extraction content hash is required.");
  assertNonEmpty(
    payload.extractionStrategyVersion,
    "Resource extraction strategy version is required.",
  );
  assertNonEmpty(
    payload.chunkingStrategyVersion,
    "Resource extraction chunking strategy version is required.",
  );
  assertNonEmpty(payload.requestedAt, "Resource extraction requested-at timestamp is required.");

  if (!Number.isSafeInteger(payload.byteSize) || payload.byteSize < 0) {
    throw new Error("Resource extraction byte size must be a non-negative integer.");
  }
}

function assertNonEmpty(value: string, message: string): void {
  if (value.trim().length === 0) {
    throw new Error(message);
  }
}