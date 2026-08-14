import { randomUUID } from "node:crypto";

import type {
  IsoDateTimeString,
} from "@avora/core/time";

import type {
  PlacementCandidate,
  PlacementCorrection,
  ResourcePlacement,
  ResourcePlacementId,
} from "../contracts/index.js";
import type {
  GetResourcePlacementByIdInput,
  GetResourcePlacementByResourceInput,
  ListPlacementCorrectionsByResourceInput,
  RecordPlacementCorrectionInput,
  ResourcePlacementRepositoryPort,
} from "../repositories/index.js";
import type {
  PlacementPolicy,
} from "../policies/index.js";
import {
  defaultPlacementPolicy,
} from "../policies/index.js";

export type ResourcePlacementServiceErrorCode =
  | "resource_placement_invalid_candidate"
  | "resource_placement_inconsistent_policy_decision";

export class ResourcePlacementServiceError extends Error {
  public readonly code: ResourcePlacementServiceErrorCode;

  public constructor(
    code: ResourcePlacementServiceErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ResourcePlacementServiceError";
    this.code = code;
  }
}

export type PlaceResourceCandidateInput = Readonly<{
  candidate: PlacementCandidate;
}>;

export type ResourcePlacementPlacedResult = Readonly<{
  outcome: "placed";
  decision: "accepted" | "tentative";
  placement: ResourcePlacement;
  reason: string;
}>;

export type ResourcePlacementNeedsReviewResult = Readonly<{
  outcome: "needs_review";
  decision: "needs_review";
  candidate: PlacementCandidate;
  reason: string;
}>;

export type PlaceResourceCandidateResult =
  | ResourcePlacementPlacedResult
  | ResourcePlacementNeedsReviewResult;

export type ResourcePlacementService = Readonly<{
  placeResourceCandidate: (
    input: PlaceResourceCandidateInput,
  ) => Promise<PlaceResourceCandidateResult>;
  getPlacementByResource: (
    input: GetResourcePlacementByResourceInput,
  ) => Promise<ResourcePlacement | null>;
  getPlacementById: (
    input: GetResourcePlacementByIdInput,
  ) => Promise<ResourcePlacement | null>;
  recordPlacementCorrection: (
    input: RecordPlacementCorrectionInput,
  ) => Promise<PlacementCorrection>;
  listPlacementCorrectionsByResource: (
    input: ListPlacementCorrectionsByResourceInput,
  ) => Promise<readonly PlacementCorrection[]>;
}>;

export type ResourcePlacementServiceDependencies = Readonly<{
  repository: ResourcePlacementRepositoryPort;
  policy?: PlacementPolicy;
  createPlacementId?: () => ResourcePlacementId;
  now?: () => IsoDateTimeString;
}>;

export function createResourcePlacementService(
  dependencies: ResourcePlacementServiceDependencies,
): ResourcePlacementService {
  const policy = dependencies.policy ?? defaultPlacementPolicy;
  const createPlacementId =
    dependencies.createPlacementId ?? defaultCreatePlacementId;
  const now = dependencies.now ?? defaultNow;

  return {
    placeResourceCandidate: async (
      input: PlaceResourceCandidateInput,
    ): Promise<PlaceResourceCandidateResult> => {
      assertValidPlacementCandidate(input.candidate);

      const decision = policy.decidePlacementCandidate(input.candidate);

      assertPolicyDecisionMatchesCandidate(input.candidate, decision);

      if (decision.decision === "needs_review") {
        return {
          outcome: "needs_review",
          decision: "needs_review",
          candidate: input.candidate,
          reason: decision.reason,
        };
      }

      const timestamp = now();

      const placement: ResourcePlacement = {
        placementId: createPlacementId(),
        studentId: input.candidate.studentId,
        resourceId: input.candidate.resourceId,
        target: decision.target,
        confidence: decision.confidence,
        status: decision.decision,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const savedPlacement = await dependencies.repository.savePlacement({
        placement,
        candidate: input.candidate,
        placementReason: decision.reason,
      });

      return {
        outcome: "placed",
        decision: decision.decision,
        placement: savedPlacement,
        reason: decision.reason,
      };
    },

    getPlacementByResource: async (
      input: GetResourcePlacementByResourceInput,
    ): Promise<ResourcePlacement | null> =>
      dependencies.repository.getPlacementByResource(input),

    getPlacementById: async (
      input: GetResourcePlacementByIdInput,
    ): Promise<ResourcePlacement | null> =>
      dependencies.repository.getPlacementById(input),

    recordPlacementCorrection: async (
      input: RecordPlacementCorrectionInput,
    ): Promise<PlacementCorrection> =>
      dependencies.repository.recordCorrection(input),

    listPlacementCorrectionsByResource: async (
      input: ListPlacementCorrectionsByResourceInput,
    ): Promise<readonly PlacementCorrection[]> =>
      dependencies.repository.listCorrectionsByResource(input),
  };
}

function assertValidPlacementCandidate(candidate: PlacementCandidate): void {
  assertNonEmpty(
    candidate.candidateId,
    "Resource placement requires a candidate id.",
  );
  assertNonEmpty(
    candidate.studentId,
    "Resource placement requires a student id.",
  );
  assertNonEmpty(
    candidate.resourceId,
    "Resource placement requires a resource id.",
  );
  assertNonEmpty(
    candidate.target.termId,
    "Resource placement requires a term id.",
  );
  assertNonEmpty(
    candidate.target.subjectId,
    "Resource placement requires a subject id.",
  );

  if (candidate.reason !== null) {
    assertNonEmpty(
      candidate.reason,
      "Resource placement candidate reason must not be blank.",
    );
  }

  if (candidate.confidence.reason !== null) {
    assertNonEmpty(
      candidate.confidence.reason,
      "Resource placement confidence reason must not be blank.",
    );
  }

  assertNonEmpty(
    candidate.createdAt,
    "Resource placement candidate requires a created-at timestamp.",
  );
}

function assertPolicyDecisionMatchesCandidate(
  candidate: PlacementCandidate,
  decision: ReturnType<PlacementPolicy["decidePlacementCandidate"]>,
): void {
  if (decision.studentId !== candidate.studentId) {
    throw new ResourcePlacementServiceError(
      "resource_placement_inconsistent_policy_decision",
      "Placement policy decision student does not match the candidate student.",
    );
  }

  if (decision.resourceId !== candidate.resourceId) {
    throw new ResourcePlacementServiceError(
      "resource_placement_inconsistent_policy_decision",
      "Placement policy decision resource does not match the candidate resource.",
    );
  }

  if (decision.target.termId !== candidate.target.termId) {
    throw new ResourcePlacementServiceError(
      "resource_placement_inconsistent_policy_decision",
      "Placement policy decision term does not match the candidate target.",
    );
  }

  if (decision.target.subjectId !== candidate.target.subjectId) {
    throw new ResourcePlacementServiceError(
      "resource_placement_inconsistent_policy_decision",
      "Placement policy decision subject does not match the candidate target.",
    );
  }

  if (decision.target.structureUnitId !== candidate.target.structureUnitId) {
    throw new ResourcePlacementServiceError(
      "resource_placement_inconsistent_policy_decision",
      "Placement policy decision structure unit does not match the candidate target.",
    );
  }

  if (decision.confidence.level !== candidate.confidence.level) {
    throw new ResourcePlacementServiceError(
      "resource_placement_inconsistent_policy_decision",
      "Placement policy decision confidence level does not match the candidate confidence.",
    );
  }

  if (decision.confidence.source !== candidate.confidence.source) {
    throw new ResourcePlacementServiceError(
      "resource_placement_inconsistent_policy_decision",
      "Placement policy decision confidence source does not match the candidate confidence.",
    );
  }

  if (decision.confidence.reason !== candidate.confidence.reason) {
    throw new ResourcePlacementServiceError(
      "resource_placement_inconsistent_policy_decision",
      "Placement policy decision confidence reason does not match the candidate confidence.",
    );
  }

  assertNonEmpty(
    decision.reason,
    "Placement policy decision requires a reason.",
  );
}

function defaultCreatePlacementId(): ResourcePlacementId {
  return randomUUID() as ResourcePlacementId;
}

function defaultNow(): IsoDateTimeString {
  return new Date().toISOString() as IsoDateTimeString;
}

function assertNonEmpty(value: string, message: string): void {
  if (value.trim().length === 0) {
    throw new ResourcePlacementServiceError(
      "resource_placement_invalid_candidate",
      message,
    );
  }
}