import type { ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";
import {
  createResourcePlacementService,
} from "@avora/domain/resources";
import type {
  GetPlacementCandidateByIdInput,
  GetResourcePlacementByIdInput,
  GetResourcePlacementByResourceInput,
  ListPlacementCandidatesByResourceInput,
  ListPlacementCorrectionsByResourceInput,
  ListPlacementCorrectionsByStudentInput,
  ListResourcePlacementsByAcademicUnitInput,
  PlacementCandidate,
  PlacementCorrection,
  RecordPlacementCorrectionInput,
  ResourcePlacement,
  ResourcePlacementRepositoryPort,
  SavePlacementCandidateInput,
  SaveResourcePlacementInput,
} from "@avora/domain/resources";

// This harness validates the Stage 9 Group 6 completion flow
// (e2e/flows/resource-placement/resource-placement.flow-plan.json) at the
// composed domain-service layer, exactly as e2e/flows/tutor-grounding does
// for the tutor gateway: the real ResourcePlacementService and real
// PlacementPolicy are exercised against an in-memory repository double that
// enforces the same student_id predicate the real RLS policies enforce
// (single predicate, deny-by-default), so cross-student assertions are
// meaningful rather than trivially true.
//
// Per the flow plan's own scope.excludes, this harness does not implement
// classifier execution, worker execution, AI/provider calls, a new DB
// migration, a new repository, a new domain service, or a new web route —
// it composes only pre-existing public surface
// (createResourcePlacementService) with a test-only fake of the pre-existing
// ResourcePlacementRepositoryPort interface.

class ResourcePlacementE2eFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "ResourcePlacementE2eFailure";
  }
}

function assert(condition: boolean, caseId: string, reason: string): asserts condition {
  if (!condition) {
    throw new ResourcePlacementE2eFailure(caseId, reason);
  }
}

export type ResourcePlacementE2eCaseResult = Readonly<{
  caseId: string;
  passed: true;
}>;

const studentA = "student-a" as StudentId;
const studentB = "student-b" as StudentId;
const resourceA = "resource-a" as ResourceId;

function createInMemoryResourcePlacementRepository(): ResourcePlacementRepositoryPort {
  const candidates = new Map<string, PlacementCandidate>();
  const placements = new Map<string, ResourcePlacement>();
  const corrections: PlacementCorrection[] = [];

  return {
    savePlacementCandidate: async (
      input: SavePlacementCandidateInput,
    ): Promise<PlacementCandidate> => {
      candidates.set(input.candidate.candidateId, input.candidate);
      return input.candidate;
    },

    getPlacementCandidateById: async (
      lookup: GetPlacementCandidateByIdInput,
    ): Promise<PlacementCandidate | null> => {
      const candidate = candidates.get(lookup.candidateId);
      // Mirrors the RLS single predicate (student_id = auth.uid()): a
      // candidate that exists but belongs to a different student is denied,
      // never returned.
      return candidate !== undefined && candidate.studentId === lookup.studentId
        ? candidate
        : null;
    },

    listPlacementCandidatesByResource: async (
      lookup: ListPlacementCandidatesByResourceInput,
    ): Promise<readonly PlacementCandidate[]> =>
      [...candidates.values()].filter(
        (candidate) =>
          candidate.studentId === lookup.studentId
          && candidate.resourceId === lookup.resourceId,
      ),

    savePlacement: async (
      input: SaveResourcePlacementInput,
    ): Promise<ResourcePlacement> => {
      placements.set(placementKey(input.placement.studentId, input.placement.resourceId), input.placement);
      return input.placement;
    },

    replacePlacement: async (
      input: SaveResourcePlacementInput,
    ): Promise<ResourcePlacement> => {
      placements.set(placementKey(input.placement.studentId, input.placement.resourceId), input.placement);
      return input.placement;
    },

    getPlacementByResource: async (
      lookup: GetResourcePlacementByResourceInput,
    ): Promise<ResourcePlacement | null> =>
      placements.get(placementKey(lookup.studentId, lookup.resourceId)) ?? null,

    getPlacementById: async (
      lookup: GetResourcePlacementByIdInput,
    ): Promise<ResourcePlacement | null> => {
      const placement = [...placements.values()].find(
        (candidate) => candidate.placementId === lookup.placementId,
      );
      return placement !== undefined && placement.studentId === lookup.studentId
        ? placement
        : null;
    },

    recordCorrection: async (
      input: RecordPlacementCorrectionInput,
    ): Promise<PlacementCorrection> => {
      corrections.push(input.correction);
      return input.correction;
    },

    listCorrectionsByResource: async (
      lookup: ListPlacementCorrectionsByResourceInput,
    ): Promise<readonly PlacementCorrection[]> =>
      corrections.filter(
        (correction) =>
          correction.studentId === lookup.studentId
          && correction.resourceId === lookup.resourceId,
      ),

    listCorrectionsByStudent: async (
      lookup: ListPlacementCorrectionsByStudentInput,
    ): Promise<readonly PlacementCorrection[]> =>
      corrections.filter((correction) => correction.studentId === lookup.studentId),

    listResourcePlacementsByAcademicUnit: async (
      lookup: ListResourcePlacementsByAcademicUnitInput,
    ): Promise<readonly ResourcePlacement[]> =>
      [...placements.values()].filter(
        (placement) =>
          placement.studentId === lookup.studentId
          && placement.target.termId === lookup.target.termId
          && (lookup.target.subjectId === null || placement.target.subjectId === lookup.target.subjectId)
          && (lookup.target.structureUnitId === null
            || placement.target.structureUnitId === lookup.target.structureUnitId),
      ),
  };
}

function placementKey(studentId: StudentId, resourceId: ResourceId): string {
  return `${studentId}:${resourceId}`;
}

function buildCandidate(): PlacementCandidate {
  return {
    candidateId: "candidate-a" as PlacementCandidate["candidateId"],
    studentId: studentA,
    resourceId: resourceA,
    target: {
      termId: "term-a" as PlacementCandidate["target"]["termId"],
      subjectId: "subject-a" as PlacementCandidate["target"]["subjectId"],
      structureUnitId: "unit-a" as PlacementCandidate["target"]["structureUnitId"],
    },
    confidence: { level: "high", source: "system_suggested", reason: "e2e fixture" },
    provenance: "resource_content",
    reason: "e2e fixture",
    createdAt: "2026-01-01T00:00:00.000Z" as IsoDateTimeString,
  };
}

export async function runResourcePlacementE2eHarness(): Promise<
  readonly ResourcePlacementE2eCaseResult[]
> {
  const results = [
    await runFullSuccessPathCase(),
    await runCrossStudentCandidateReadDeniedCase(),
    await runCrossStudentAcceptDeniedCase(),
    await runCrossStudentAcademicUnitListingDeniedCase(),
  ];

  if (results.length === 0) {
    throw new ResourcePlacementE2eFailure(
      "resource-placement",
      "harness has no cases and must fail closed",
    );
  }

  return results;
}

async function runFullSuccessPathCase(): Promise<ResourcePlacementE2eCaseResult> {
  const caseId = "resource-placement-e2e-full-success-path";
  const repository = createInMemoryResourcePlacementRepository();
  const service = createResourcePlacementService({ repository });

  // Step 4-5: trusted classification infrastructure persists a candidate.
  const candidate = buildCandidate();
  await service.savePlacementCandidate({ candidate });

  // Step 6: student A reads the persisted candidate through the
  // student-scoped read surface.
  const readCandidates = await service.listPlacementCandidatesByResource({
    studentId: studentA,
    resourceId: resourceA,
  });

  assert(readCandidates.length === 1, caseId, "expected exactly one persisted candidate");
  assert(readCandidates[0]?.candidateId === candidate.candidateId, caseId, "expected the persisted candidate id");

  // Step 7: student A accepts the existing candidate by id only — the
  // existing placement policy, not this harness, decides the outcome.
  const acceptResult = await service.acceptPlacementCandidate({
    studentId: studentA,
    candidateId: candidate.candidateId,
  });

  assert(acceptResult.outcome === "placed", caseId, "expected acceptance to place the resource");

  const placement = await service.getPlacementByResource({
    studentId: studentA,
    resourceId: resourceA,
  });

  assert(placement !== null, caseId, "expected a persisted placement after acceptance");
  assert(
    placement?.target.subjectId === candidate.target.subjectId,
    caseId,
    "expected the placement target to match the accepted candidate target",
  );

  // Step 8: record a correction.
  const correctedTarget = {
    termId: candidate.target.termId,
    subjectId: candidate.target.subjectId,
    structureUnitId: "unit-b" as PlacementCandidate["target"]["structureUnitId"],
  };

  const correction = await service.recordPlacementCorrection({
    correction: {
      correctionId: "correction-a" as PlacementCorrection["correctionId"],
      studentId: studentA,
      resourceId: resourceA,
      previousTarget: placement?.target ?? null,
      correctedTarget,
      reason: "e2e correction",
      correctedAt: "2026-01-01T00:01:00.000Z" as IsoDateTimeString,
    },
  });

  assert(
    correction.correctedTarget.structureUnitId === correctedTarget.structureUnitId,
    caseId,
    "expected the correction to record the corrected target",
  );

  // Step 9: list placements by academic unit.
  const listed = await service.listResourcePlacementsByAcademicUnit({
    studentId: studentA,
    target: {
      termId: candidate.target.termId,
      subjectId: candidate.target.subjectId,
      structureUnitId: null,
    },
  });

  assert(listed.some((entry) => entry.resourceId === resourceA), caseId, "expected the placement to appear in the academic-unit listing");

  return { caseId, passed: true };
}

async function runCrossStudentCandidateReadDeniedCase(): Promise<ResourcePlacementE2eCaseResult> {
  const caseId = "resource-placement-e2e-cross-student-candidate-read-denied";
  const repository = createInMemoryResourcePlacementRepository();
  const service = createResourcePlacementService({ repository });

  await service.savePlacementCandidate({ candidate: buildCandidate() });

  const readAsStudentB = await service.listPlacementCandidatesByResource({
    studentId: studentB,
    resourceId: resourceA,
  });

  assert(readAsStudentB.length === 0, caseId, "expected student B to see no candidates for student A's resource");

  return { caseId, passed: true };
}

async function runCrossStudentAcceptDeniedCase(): Promise<ResourcePlacementE2eCaseResult> {
  const caseId = "resource-placement-e2e-cross-student-accept-denied";
  const repository = createInMemoryResourcePlacementRepository();
  const service = createResourcePlacementService({ repository });

  const candidate = buildCandidate();
  await service.savePlacementCandidate({ candidate });

  let deniedAsExpected = false;

  try {
    await service.acceptPlacementCandidate({
      studentId: studentB,
      candidateId: candidate.candidateId,
    });
  } catch {
    deniedAsExpected = true;
  }

  assert(deniedAsExpected, caseId, "expected student B accepting student A's candidate to be denied");

  const placementAfterAttempt = await service.getPlacementByResource({
    studentId: studentA,
    resourceId: resourceA,
  });

  assert(placementAfterAttempt === null, caseId, "expected student A's resource to remain unplaced after a denied cross-student accept attempt");

  return { caseId, passed: true };
}

async function runCrossStudentAcademicUnitListingDeniedCase(): Promise<ResourcePlacementE2eCaseResult> {
  const caseId = "resource-placement-e2e-cross-student-academic-unit-listing-denied";
  const repository = createInMemoryResourcePlacementRepository();
  const service = createResourcePlacementService({ repository });

  const candidate = buildCandidate();
  await service.savePlacementCandidate({ candidate });
  await service.acceptPlacementCandidate({ studentId: studentA, candidateId: candidate.candidateId });

  const listedAsStudentB = await service.listResourcePlacementsByAcademicUnit({
    studentId: studentB,
    target: {
      termId: candidate.target.termId,
      subjectId: candidate.target.subjectId,
      structureUnitId: null,
    },
  });

  assert(listedAsStudentB.length === 0, caseId, "expected student B to see no entries in student A's academic-unit listing");

  return { caseId, passed: true };
}
