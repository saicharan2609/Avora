import type {
  AcceptResourcePlacementCandidateResponseBody,
  CreateResourcePlacementCorrectionResponseBody,
  ResourcePlacementApiCandidate,
  ResourcePlacementApiConfidence,
  ResourcePlacementApiCorrection,
  ResourcePlacementApiPlacement,
  ResourcePlacementApiTarget,
  ResourcePlacementCandidatesResponseBody,
  ResourcePlacementsByAcademicUnitResponseBody,
} from "@avora/core/contracts/resources/placement";
import type {
  PlacementCandidate,
  PlacementCorrection,
  PlaceResourceCandidateResult,
  ResourcePlacement,
  ResourcePlacementTarget,
} from "@avora/domain/resources";
import type {
  PlacementConfidence,
} from "@avora/domain/academic";

export function serializePlacementCandidates(
  candidates: readonly PlacementCandidate[],
): ResourcePlacementCandidatesResponseBody {
  return {
    candidates: candidates.map(serializePlacementCandidate),
  };
}

export function serializeAcceptPlacementCandidateResult(
  result: PlaceResourceCandidateResult,
): AcceptResourcePlacementCandidateResponseBody {
  if (result.outcome === "needs_review") {
    return {
      result: {
        outcome: "needs_review",
        decision: "needs_review",
        candidate: serializePlacementCandidate(result.candidate),
        reason: result.reason,
      },
    };
  }

  return {
    result: {
      outcome: "placed",
      decision: result.decision,
      placement: serializeResourcePlacement(result.placement),
      reason: result.reason,
    },
  };
}

export function serializePlacementCorrectionResponse(
  correction: PlacementCorrection,
): CreateResourcePlacementCorrectionResponseBody {
  return {
    correction: serializePlacementCorrection(correction),
  };
}

export function serializeResourcePlacementsByAcademicUnit(
  placements: readonly ResourcePlacement[],
): ResourcePlacementsByAcademicUnitResponseBody {
  return {
    placements: placements.map(serializeResourcePlacement),
  };
}

function serializePlacementCandidate(
  candidate: PlacementCandidate,
): ResourcePlacementApiCandidate {
  return {
    candidateId: candidate.candidateId,
    resourceId: candidate.resourceId,
    target: serializePlacementTarget(candidate.target),
    confidence: serializePlacementConfidence(candidate.confidence),
    provenance: candidate.provenance,
    reason: candidate.reason,
    createdAt: candidate.createdAt,
  };
}

function serializeResourcePlacement(
  placement: ResourcePlacement,
): ResourcePlacementApiPlacement {
  return {
    placementId: placement.placementId,
    resourceId: placement.resourceId,
    target: serializePlacementTarget(placement.target),
    confidence: serializePlacementConfidence(placement.confidence),
    status: placement.status,
    createdAt: placement.createdAt,
    updatedAt: placement.updatedAt,
  };
}

function serializePlacementCorrection(
  correction: PlacementCorrection,
): ResourcePlacementApiCorrection {
  return {
    correctionId: correction.correctionId,
    resourceId: correction.resourceId,
    previousTarget:
      correction.previousTarget === null
        ? null
        : serializePlacementTarget(correction.previousTarget),
    correctedTarget: serializePlacementTarget(correction.correctedTarget),
    reason: correction.reason,
    correctedAt: correction.correctedAt,
  };
}

function serializePlacementTarget(
  target: ResourcePlacementTarget,
): ResourcePlacementApiTarget {
  return {
    termId: target.termId,
    subjectId: target.subjectId,
    structureUnitId: target.structureUnitId,
  };
}

function serializePlacementConfidence(
  confidence: PlacementConfidence,
): ResourcePlacementApiConfidence {
  return {
    level: confidence.level,
    source: confidence.source,
    reason: confidence.reason,
  };
}