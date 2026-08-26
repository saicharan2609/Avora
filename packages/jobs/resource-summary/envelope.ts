import type { IsoDateTimeString } from "@avora/core/time";
import type {
  CreateResourceSummaryJobEnvelopeInput,
  ResourceSummaryJobEnvelope,
} from "./contracts.js";
import {
  createResourceSummaryJobId,
  resourceSummaryJobName,
} from "./contracts.js";

export function createResourceSummaryJobEnvelope(
  input: CreateResourceSummaryJobEnvelopeInput,
): ResourceSummaryJobEnvelope {
  assertValidResourceSummaryPayload(input.payload);

  return {
    jobId: createResourceSummaryJobId(),
    name: resourceSummaryJobName,
    reason: input.reason,
    priority: input.priority,
    payload: input.payload,
    enqueuedAt:
  input.enqueuedAt ??
  (new Date().toISOString() as IsoDateTimeString),
  };
}

function assertValidResourceSummaryPayload(
  payload: CreateResourceSummaryJobEnvelopeInput["payload"],
): void {
  assertNonEmpty(
    payload.promptVersion,
    "Resource summary prompt version is required.",
  );
  assertNonEmpty(
    payload.summaryStrategyVersion,
    "Resource summary strategy version is required.",
  );
  assertNonEmpty(
    payload.requestedAt,
    "Resource summary requested-at timestamp is required.",
  );
}

function assertNonEmpty(value: string, message: string): void {
  if (value.trim().length === 0) {
    throw new Error(message);
  }
}
