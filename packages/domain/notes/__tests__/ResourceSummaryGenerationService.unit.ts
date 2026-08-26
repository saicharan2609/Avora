import type { ChunkId, ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type {
  ResourceSummaryCandidate,
} from "../services/ResourceSummaryGenerationService.js";
import {
  createResourceSummaryGenerationService,
} from "../services/ResourceSummaryGenerationService.js";
import { ResourceSummaryGenerationServiceError } from "../services/ResourceSummaryGenerationService.errors.js";

class ResourceSummaryGenerationServiceUnitFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "ResourceSummaryGenerationServiceUnitFailure";
  }
}

function assert(condition: boolean, caseId: string, reason: string): asserts condition {
  if (!condition) {
    throw new ResourceSummaryGenerationServiceUnitFailure(caseId, reason);
  }
}

const studentId = "student-1" as StudentId;
const resourceId = "resource-1" as ResourceId;
const createdAt = "2026-01-01T00:00:00.000Z" as IsoDateTimeString;

function buildValidCandidate(): ResourceSummaryCandidate {
  return {
    body: {
      headings: [
        {
          title: "Linked Lists",
          points: ["A linked list is a sequence of nodes."],
        },
      ],
    },
    citations: [
      {
        chunkId: "chunk-1" as unknown as ChunkId,
        quote: "A linked list is a sequence of nodes.",
      },
    ],
    modelVersion: "gemini-3.6-flash",
  };
}

function testBuildsValidSummary(): void {
  const service = createResourceSummaryGenerationService();

  const summary = service.buildResourceSummary({
    studentId,
    resourceId,
    promptVersion: "summary-system-policy.v1",
    summaryStrategyVersion: "summary.generate.v1",
    candidate: buildValidCandidate(),
    createdAt,
  });

  assert(
    summary.provenance === "ai",
    "builds-valid-summary",
    "expected provenance to be ai",
  );
  assert(
    summary.citations.length === 1,
    "builds-valid-summary",
    "expected one citation to be carried through",
  );
  assert(
    summary.modelVersion === "gemini-3.6-flash",
    "builds-valid-summary",
    "expected model version to be carried through",
  );
}

function testRejectsEmptyBody(): void {
  const service = createResourceSummaryGenerationService();

  let threw = false;

  try {
    service.buildResourceSummary({
      studentId,
      resourceId,
      promptVersion: "summary-system-policy.v1",
      summaryStrategyVersion: "summary.generate.v1",
      candidate: {
        body: { headings: [] },
        citations: buildValidCandidate().citations,
        modelVersion: buildValidCandidate().modelVersion,
      },
      createdAt,
    });
  } catch (error) {
    threw = error instanceof ResourceSummaryGenerationServiceError
      && error.code === "resource_summary_generation_empty_body";
  }

  assert(threw, "rejects-empty-body", "expected an empty-body rejection");
}

function testRejectsMissingCitation(): void {
  const service = createResourceSummaryGenerationService();

  let threw = false;

  try {
    service.buildResourceSummary({
      studentId,
      resourceId,
      promptVersion: "summary-system-policy.v1",
      summaryStrategyVersion: "summary.generate.v1",
      candidate: {
        body: buildValidCandidate().body,
        citations: [],
        modelVersion: buildValidCandidate().modelVersion,
      },
      createdAt,
    });
  } catch (error) {
    threw = error instanceof ResourceSummaryGenerationServiceError
      && error.code === "resource_summary_generation_missing_citation";
  }

  assert(threw, "rejects-missing-citation", "expected a missing-citation rejection");
}

function testRejectsMissingModelVersion(): void {
  const service = createResourceSummaryGenerationService();

  let threw = false;

  try {
    service.buildResourceSummary({
      studentId,
      resourceId,
      promptVersion: "summary-system-policy.v1",
      summaryStrategyVersion: "summary.generate.v1",
      candidate: {
        body: buildValidCandidate().body,
        citations: buildValidCandidate().citations,
        modelVersion: "",
      },
      createdAt,
    });
  } catch (error) {
    threw = error instanceof ResourceSummaryGenerationServiceError
      && error.code === "resource_summary_generation_missing_model_version";
  }

  assert(threw, "rejects-missing-model-version", "expected a missing-model-version rejection");
}

testBuildsValidSummary();
testRejectsEmptyBody();
testRejectsMissingCitation();
testRejectsMissingModelVersion();

// eslint-disable-next-line no-console
console.log("ResourceSummaryGenerationService.unit: all cases passed");
