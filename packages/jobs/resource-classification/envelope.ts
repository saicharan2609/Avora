import type { IsoDateTimeString } from "@avora/core/time";
import type {
  CreateResourceClassificationJobEnvelopeInput,
  ResourceClassificationJobEnvelope,
} from "./contracts.js";
import {
  createResourceClassificationJobId,
  resourceClassificationJobName,
} from "./contracts.js";

export function createResourceClassificationJobEnvelope(
  input: CreateResourceClassificationJobEnvelopeInput,
): ResourceClassificationJobEnvelope {
  assertValidResourceClassificationPayload(input.payload);

  return {
    jobId: createResourceClassificationJobId(),
    name: resourceClassificationJobName,
    reason: input.reason,
    priority: input.priority,
    payload: input.payload,
    enqueuedAt:
  input.enqueuedAt ??
  (new Date().toISOString() as IsoDateTimeString),
  };
}

function assertValidResourceClassificationPayload(
  payload: CreateResourceClassificationJobEnvelopeInput["payload"],
): void {
  assertNonEmpty(
    payload.classificationStrategyVersion,
    "Resource classification strategy version is required.",
  );
  assertNonEmpty(
    payload.placementPolicyVersion,
    "Resource placement policy version is required.",
  );
  assertNonEmpty(
    payload.requestedAt,
    "Resource classification requested-at timestamp is required.",
  );
}

function assertNonEmpty(value: string, message: string): void {
  if (value.trim().length === 0) {
    throw new Error(message);
  }
}