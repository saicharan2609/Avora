import type {
  CreateResourceChunkingJobEnvelopeInput,
  ResourceChunkingJobRequest,
} from "./contracts.js";
import {
  resourceChunkingJobName,
} from "./contracts.js";

export function createResourceChunkingJobEnvelope(
  input: CreateResourceChunkingJobEnvelopeInput,
): ResourceChunkingJobRequest {
  assertValidResourceChunkingPayload(input.payload);

  return {
    name: resourceChunkingJobName,
    reason: input.reason,
    priority: input.priority,
    payload: input.payload,
  };
}

function assertValidResourceChunkingPayload(
  payload: CreateResourceChunkingJobEnvelopeInput["payload"],
): void {
  assertNonEmpty(payload.extractionDocumentId, "Resource chunking extraction document id is required.");
  assertNonEmpty(payload.sourceContentHash, "Resource chunking source content hash is required.");
  assertNonEmpty(
    payload.chunkingStrategyVersion,
    "Resource chunking strategy version is required.",
  );
  assertNonEmpty(
    payload.sanitisationStrategyVersion,
    "Resource chunking sanitisation strategy version is required.",
  );
  assertNonEmpty(payload.requestedAt, "Resource chunking requested-at timestamp is required.");
}

function assertNonEmpty(value: string, message: string): void {
  if (value.trim().length === 0) {
    throw new Error(message);
  }
}
