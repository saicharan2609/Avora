// This service stamps provenance: "ai" (NN-07) on every ResourceSummary it
// builds. The stamp is rendered at presentation via AIGeneratedBadge
// (ResourceSummaryCardContract.provenance in
// packages/ui-web/domain-components/ResourceSummaryCard.contract.ts and its
// ui-mobile mirror) — this service itself performs no rendering.
import type {
  ResourceId,
  StudentId,
} from "@avora/core/identity";
import type {
  IsoDateTimeString,
} from "@avora/core/time";

import type {
  ResourceSummary,
  ResourceSummaryBody,
  ResourceSummaryCitation,
} from "../contracts/ResourceSummary.contract.js";
import {
  ResourceSummaryGenerationServiceError,
} from "./ResourceSummaryGenerationService.errors.js";

export type ResourceSummaryCandidate = Readonly<{
  body: ResourceSummaryBody;
  citations: readonly ResourceSummaryCitation[];
  // ENG-235: the concrete provider model that produced this candidate,
  // known only once AI Gateway invocation completes — unlike promptVersion
  // and summaryStrategyVersion below, which are known before invocation.
  modelVersion: string;
}>;

export type BuildResourceSummaryInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  promptVersion: string;
  summaryStrategyVersion: string;
  candidate: ResourceSummaryCandidate;
  createdAt: IsoDateTimeString;
}>;

export type ResourceSummaryGenerationService = Readonly<{
  buildResourceSummary: (input: BuildResourceSummaryInput) => ResourceSummary;
}>;

export function createResourceSummaryGenerationService(): ResourceSummaryGenerationService {
  return {
    buildResourceSummary: (input: BuildResourceSummaryInput): ResourceSummary => {
      assertValidCandidate(input.candidate);

      return {
        resourceId: input.resourceId,
        studentId: input.studentId,
        promptVersion: input.promptVersion,
        summaryStrategyVersion: input.summaryStrategyVersion,
        modelVersion: input.candidate.modelVersion,
        body: input.candidate.body,
        citations: input.candidate.citations,
        provenance: "ai",
        createdAt: input.createdAt,
      };
    },
  };
}

function assertValidCandidate(candidate: ResourceSummaryCandidate): void {
  if (candidate.body.headings.length === 0) {
    throw new ResourceSummaryGenerationServiceError(
      "resource_summary_generation_empty_body",
      "Resource summary body must contain at least one heading.",
    );
  }

  for (const heading of candidate.body.headings) {
    if (heading.title.trim().length === 0 || heading.points.length === 0) {
      throw new ResourceSummaryGenerationServiceError(
        "resource_summary_generation_empty_heading",
        "Resource summary heading requires a non-empty title and at least one point.",
      );
    }
  }

  if (candidate.citations.length === 0) {
    throw new ResourceSummaryGenerationServiceError(
      "resource_summary_generation_missing_citation",
      "Resource summary requires at least one citation to the source resource's chunks.",
    );
  }

  if (candidate.modelVersion.trim().length === 0) {
    throw new ResourceSummaryGenerationServiceError(
      "resource_summary_generation_missing_model_version",
      "Resource summary requires the concrete provider model version that produced it (ENG-235).",
    );
  }
}
