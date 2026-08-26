import type { StudentId, ResourceId } from "@avora/core/identity";
import {
  createResourceClassificationService,
} from "@avora/domain/resources";

import type {
  ResourceClassificationQualityCase,
} from "./resource-classification-quality.fixture.js";

export const resourceClassificationAccuracyGateThreshold = 0.85;

export class ResourceClassificationQualityGateFailure extends Error {
  public constructor(reason: string) {
    super(reason);
    this.name = "ResourceClassificationQualityGateFailure";
  }
}

export type ResourceClassificationQualityCaseOutcome = Readonly<{
  caseId: string;
  correct: boolean;
  actualSubjectId: string | null;
  actualStructureUnitId: string | null;
}>;

export type ResourceClassificationQualityGateResult = Readonly<{
  totalCases: number;
  correctCases: number;
  accuracy: number;
  outcomes: readonly ResourceClassificationQualityCaseOutcome[];
}>;

export function runResourceClassificationQualityGate(
  cases: readonly ResourceClassificationQualityCase[],
): ResourceClassificationQualityGateResult {
  if (cases.length === 0) {
    throw new ResourceClassificationQualityGateFailure(
      "resource-classification-quality gate has no cases and must fail closed",
    );
  }

  const classificationService = createResourceClassificationService();

  const outcomes = cases.map((evaluationCase) => evaluateCase(classificationService, evaluationCase));
  const correctCases = outcomes.filter((outcome) => outcome.correct).length;
  const accuracy = correctCases / cases.length;

  if (accuracy <= resourceClassificationAccuracyGateThreshold) {
    const failing = outcomes.filter((outcome) => !outcome.correct).map((outcome) => outcome.caseId);

    throw new ResourceClassificationQualityGateFailure(
      `resource classification accuracy ${(accuracy * 100).toFixed(1)}% did not exceed the required ${(resourceClassificationAccuracyGateThreshold * 100).toFixed(0)}% threshold. Failing cases: ${failing.join(", ")}`,
    );
  }

  return {
    totalCases: cases.length,
    correctCases,
    accuracy,
    outcomes,
  };
}

function evaluateCase(
  classificationService: ReturnType<typeof createResourceClassificationService>,
  evaluationCase: ResourceClassificationQualityCase,
): ResourceClassificationQualityCaseOutcome {
  const { candidate } = classificationService.classifyResource({
    studentId: "student-eval" as StudentId,
    resourceId: "resource-eval" as ResourceId,
    classificationStrategyVersion: "classifier.v1",
    originalFilename: evaluationCase.originalFilename,
    contentSignals: evaluationCase.contentSignals,
    academicStructureTree: evaluationCase.academicStructureTree,
    correctionHistory: evaluationCase.correctionHistory,
    similaritySignals: [],
  });

  const actualSubjectId = candidate?.target.subjectId ?? null;
  const actualStructureUnitId = candidate?.target.structureUnitId ?? null;

  const correct = evaluationCase.expectedOutcome === null
    ? candidate === null
    : candidate !== null
      && actualSubjectId === evaluationCase.expectedOutcome.subjectId
      && actualStructureUnitId === evaluationCase.expectedOutcome.structureUnitId;

  return {
    caseId: evaluationCase.caseId,
    correct,
    actualSubjectId,
    actualStructureUnitId,
  };
}
