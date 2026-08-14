import type {
  ResourceId,
  StudentId,
} from "@avora/core/identity";

import type {
  PlacementConfidence,
  PlacementConfidenceLevel,
} from "../../academic/index.js";
import type {
  PlacementCandidate,
  ResourcePlacementTarget,
} from "../contracts/index.js";

export const placementPolicyDecisionKinds = [
  "accepted",
  "tentative",
  "needs_review",
] as const;

export type PlacementPolicyDecisionKind =
  (typeof placementPolicyDecisionKinds)[number];

export type PlacementPolicyDecision = Readonly<{
  decision: PlacementPolicyDecisionKind;
  studentId: StudentId;
  resourceId: ResourceId;
  target: ResourcePlacementTarget;
  confidence: PlacementConfidence;
  reason: string;
}>;

export type PlacementPolicy = Readonly<{
  decidePlacementCandidate: (
    candidate: PlacementCandidate,
  ) => PlacementPolicyDecision;
}>;

export type PlacementPolicyDecisionMap = Readonly<
  Record<PlacementConfidenceLevel, PlacementPolicyDecisionKind>
>;

export type CreatePlacementPolicyInput = Readonly<{
  decisionsByConfidenceLevel?: Partial<PlacementPolicyDecisionMap>;
}>;

export const defaultPlacementPolicyDecisionMap: PlacementPolicyDecisionMap = {
  student_confirmed: "accepted",
  high: "tentative",
  medium: "needs_review",
  low: "needs_review",
  unknown: "needs_review",
};

export const defaultPlacementPolicy: PlacementPolicy = createPlacementPolicy();

export function createPlacementPolicy(
  input: CreatePlacementPolicyInput = {},
): PlacementPolicy {
  const decisionsByConfidenceLevel = {
    ...defaultPlacementPolicyDecisionMap,
    ...input.decisionsByConfidenceLevel,
  };

  return {
    decidePlacementCandidate: (
      candidate: PlacementCandidate,
    ): PlacementPolicyDecision => decidePlacementCandidate(
      candidate,
      decisionsByConfidenceLevel,
    ),
  };
}

export function decidePlacementCandidate(
  candidate: PlacementCandidate,
  decisionsByConfidenceLevel: PlacementPolicyDecisionMap =
    defaultPlacementPolicyDecisionMap,
): PlacementPolicyDecision {
  const decision = candidate.confidence.source === "student"
    ? "accepted"
    : decisionsByConfidenceLevel[candidate.confidence.level];

  return {
    decision,
    studentId: candidate.studentId,
    resourceId: candidate.resourceId,
    target: candidate.target,
    confidence: candidate.confidence,
    reason: createPlacementPolicyDecisionReason(candidate, decision),
  };
}

function createPlacementPolicyDecisionReason(
  candidate: PlacementCandidate,
  decision: PlacementPolicyDecisionKind,
): string {
  const candidateReason = candidate.reason?.trim();

  if (candidateReason !== undefined && candidateReason.length > 0) {
    return candidateReason;
  }

  if (candidate.confidence.reason !== null) {
    const confidenceReason = candidate.confidence.reason.trim();

    if (confidenceReason.length > 0) {
      return confidenceReason;
    }
  }

  switch (decision) {
    case "accepted":
      return "Placement accepted by deterministic placement policy.";

    case "tentative":
      return "Placement marked tentative by deterministic placement policy.";

    case "needs_review":
      return "Placement requires review by deterministic placement policy.";
  }
}