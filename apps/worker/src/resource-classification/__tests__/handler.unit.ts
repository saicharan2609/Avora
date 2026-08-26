import type { ResourceId, StudentId } from "@avora/core/identity";
import type { DbAcademicStructureTree } from "@avora/db/repositories/academic";
import type { DbRetrievalChunkRecord } from "@avora/db/repositories/chunks";
import type {
  PlacementCandidate,
  ResourceClassificationService,
  ResourcePlacement,
} from "@avora/domain/resources";

import { createResourceClassificationWorkerHandler } from "../handler.js";
import type { ResourceClassificationWorkerDependencies } from "../contracts.js";

class ResourceClassificationHandlerUnitFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "ResourceClassificationHandlerUnitFailure";
  }
}

function assert(condition: boolean, caseId: string, reason: string): asserts condition {
  if (!condition) {
    throw new ResourceClassificationHandlerUnitFailure(caseId, reason);
  }
}

const studentId = "student-1" as StudentId;
const resourceId = "resource-1" as ResourceId;

const emptyAcademicStructureTree: DbAcademicStructureTree = { terms: [] };

function buildCandidate(): PlacementCandidate {
  return {
    candidateId: "candidate-placeholder" as PlacementCandidate["candidateId"],
    studentId,
    resourceId,
    target: {
      termId: "term-1" as PlacementCandidate["target"]["termId"],
      subjectId: "subject-1" as PlacementCandidate["target"]["subjectId"],
      structureUnitId: null,
    },
    confidence: { level: "high", source: "system_suggested", reason: "test" },
    provenance: "resource_content",
    reason: "test",
    createdAt: "2026-01-01T00:00:00.000Z" as PlacementCandidate["createdAt"],
  };
}

function buildDependencies(overrides: Partial<ResourceClassificationWorkerDependencies> & {
  classificationOutcome?: PlacementCandidate | null;
  savePlacementCandidateCalls?: PlacementCandidate[];
  placeResourceCandidateCalls?: PlacementCandidate[];
} = {}): ResourceClassificationWorkerDependencies {
  const savePlacementCandidateCalls = overrides.savePlacementCandidateCalls ?? [];
  const placeResourceCandidateCalls = overrides.placeResourceCandidateCalls ?? [];

  const classificationService: ResourceClassificationService = {
    classifyResource: () => ({
      candidate: overrides.classificationOutcome === undefined
        ? buildCandidate()
        : overrides.classificationOutcome,
    }),
  };

  return {
    resourcesRepository: {
      getById: async () => ({
        resourceId,
        studentId,
        kind: "document",
        originalFilename: "notes.pdf",
        declaredMimeType: "application/pdf",
        byteSize: 1,
        contentHash: null,
        lifecycleState: "ready",
        storage: { bucket: "resources", objectPath: "path", version: "1" } as never,
        createdAt: "2026-01-01T00:00:00.000Z" as never,
        updatedAt: "2026-01-01T00:00:00.000Z" as never,
      }),
    },
    retrievalChunkRepository: {
      listRetrievalChunksByResource: async () => [] as readonly DbRetrievalChunkRecord[],
    },
    academicGraphRepository: {
      getAcademicStructureTree: async () => emptyAcademicStructureTree,
    },
    placementService: {
      listPlacementCorrectionsByStudent: async () => [],
      savePlacementCandidate: async (input) => {
        savePlacementCandidateCalls.push(input.candidate);
        return input.candidate;
      },
      placeResourceCandidate: async (input) => {
        placeResourceCandidateCalls.push(input.candidate);
        return {
          outcome: "placed",
          decision: "tentative",
          placement: input.candidate as unknown as ResourcePlacement,
          reason: "test",
        };
      },
    },
    classificationService,
    ...overrides,
  };
}

async function runInsufficientEvidenceNeverPersistsOrPlacesCase(): Promise<void> {
  const caseId = "resource-classification-handler-insufficient-evidence-never-persists-or-places";
  const savePlacementCandidateCalls: PlacementCandidate[] = [];
  const placeResourceCandidateCalls: PlacementCandidate[] = [];

  const handler = createResourceClassificationWorkerHandler(buildDependencies({
    classificationOutcome: null,
    savePlacementCandidateCalls,
    placeResourceCandidateCalls,
  }));

  const result = await handler.classifyResource({
    studentId,
    resourceId,
    classificationStrategyVersion: "classifier.v1",
    placementPolicyVersion: "placement-policy.v1",
    requestedAt: "2026-01-01T00:00:00.000Z" as never,
  });

  assert(result.outcome === "insufficient_evidence", caseId, "expected insufficient_evidence outcome");
  assert(result.candidateId === null, caseId, "expected no candidate id");
  assert(savePlacementCandidateCalls.length === 0, caseId, "expected no candidate persistence call");
  assert(placeResourceCandidateCalls.length === 0, caseId, "expected no placement decision call");
}

async function runCandidateIsAlwaysPersistedBeforePlacementDecisionCase(): Promise<void> {
  const caseId = "resource-classification-handler-candidate-always-persisted-before-placement";
  const savePlacementCandidateCalls: PlacementCandidate[] = [];
  const placeResourceCandidateCalls: PlacementCandidate[] = [];

  const handler = createResourceClassificationWorkerHandler(buildDependencies({
    savePlacementCandidateCalls,
    placeResourceCandidateCalls,
  }));

  const result = await handler.classifyResource({
    studentId,
    resourceId,
    classificationStrategyVersion: "classifier.v1",
    placementPolicyVersion: "placement-policy.v1",
    requestedAt: "2026-01-01T00:00:00.000Z" as never,
  });

  assert(result.outcome === "placed", caseId, "expected placed outcome");
  assert(savePlacementCandidateCalls.length === 1, caseId, "expected exactly one candidate persistence call");
  assert(placeResourceCandidateCalls.length === 1, caseId, "expected exactly one placement decision call");
  assert(
    savePlacementCandidateCalls[0]?.candidateId === placeResourceCandidateCalls[0]?.candidateId,
    caseId,
    "expected the persisted candidate and the placed candidate to share the same id",
  );
}

async function runRetryDerivesTheSameDeterministicCandidateIdCase(): Promise<void> {
  const caseId = "resource-classification-handler-retry-derives-same-deterministic-candidate-id";
  const firstAttemptCalls: PlacementCandidate[] = [];
  const secondAttemptCalls: PlacementCandidate[] = [];

  const request = {
    studentId,
    resourceId,
    classificationStrategyVersion: "classifier.v1",
    placementPolicyVersion: "placement-policy.v1",
    requestedAt: "2026-01-01T00:00:00.000Z" as never,
  };

  const firstHandler = createResourceClassificationWorkerHandler(buildDependencies({
    savePlacementCandidateCalls: firstAttemptCalls,
  }));
  const secondHandler = createResourceClassificationWorkerHandler(buildDependencies({
    savePlacementCandidateCalls: secondAttemptCalls,
  }));

  await firstHandler.classifyResource(request);
  await secondHandler.classifyResource(request);

  assert(
    firstAttemptCalls[0]?.candidateId === secondAttemptCalls[0]?.candidateId,
    caseId,
    "expected two independent classification attempts for the same logical job to derive the same candidate id, so a retry upserts rather than duplicates",
  );
}

async function main(): Promise<void> {
  await runInsufficientEvidenceNeverPersistsOrPlacesCase();
  await runCandidateIsAlwaysPersistedBeforePlacementDecisionCase();
  await runRetryDerivesTheSameDeterministicCandidateIdCase();
}

await main();
