import type {
  ResourceExtractionQualityEvalCase,
  ResourceExtractionQualityExpectedOutcome,
  SyntheticExtractedPage,
  SyntheticExtractionFailure,
  SyntheticExtractionFailureCode,
  SyntheticExtractionProvenanceSource,
  SyntheticResourceExtractionResult,
} from "./resource-extraction-quality.fixture.js";

export type ResourceExtractionQualityGateOutcome =
  ResourceExtractionQualityExpectedOutcome;

export type ResourceExtractionQualityCaseReport = Readonly<{
  caseId: string;
  outcome: ResourceExtractionQualityGateOutcome;
  coverageRatio: number;
  averageConfidence: number;
  reasons: readonly string[];
}>;

export class ResourceExtractionQualityGateFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "ResourceExtractionQualityGateFailure";
  }
}

export function runResourceExtractionQualityGate(
  cases: readonly ResourceExtractionQualityEvalCase[],
): void {
  if (cases.length === 0) {
    throw new ResourceExtractionQualityGateFailure(
      "resource-extraction-quality",
      "gate has no cases and must fail closed",
    );
  }

  for (const evaluationCase of cases) {
    const report = evaluateResourceExtractionQualityCase(evaluationCase);

    if (report.outcome !== evaluationCase.expectations.expectedOutcome) {
      throw new ResourceExtractionQualityGateFailure(
        evaluationCase.caseId,
        `expected ${evaluationCase.expectations.expectedOutcome} but received ${report.outcome}: ${report.reasons.join("; ")}`,
      );
    }
  }
}

export function summarizeResourceExtractionQualityGate(
  cases: readonly ResourceExtractionQualityEvalCase[],
): readonly ResourceExtractionQualityCaseReport[] {
  if (cases.length === 0) {
    throw new ResourceExtractionQualityGateFailure(
      "resource-extraction-quality",
      "gate has no cases and must fail closed",
    );
  }

  return cases.map(evaluateResourceExtractionQualityCase);
}

export function evaluateResourceExtractionQualityCase(
  evaluationCase: ResourceExtractionQualityEvalCase,
): ResourceExtractionQualityCaseReport {
  const reasons: string[] = [];

  if (
    evaluationCase.result.outcome
    !== evaluationCase.expectations.expectedExtractionOutcome
  ) {
    reasons.push(
      `expected extraction outcome ${evaluationCase.expectations.expectedExtractionOutcome} but received ${evaluationCase.result.outcome}`,
    );
  }

  const coverageRatio = calculateCoverageRatio({
    result: evaluationCase.result,
    expectedFragments: evaluationCase.expectations.expectedFragments,
  });

  if (coverageRatio < evaluationCase.expectations.minCoverageRatio) {
    reasons.push(
      `coverage ${formatMetric(coverageRatio)} is below required ${formatMetric(evaluationCase.expectations.minCoverageRatio)}`,
    );
  }

  const averageConfidence = calculateAverageConfidence(evaluationCase.result);

  if (averageConfidence < evaluationCase.expectations.minAverageConfidence) {
    reasons.push(
      `average confidence ${formatMetric(averageConfidence)} is below required ${formatMetric(evaluationCase.expectations.minAverageConfidence)}`,
    );
  }

  for (const source of evaluationCase.expectations.requiredProvenanceSources) {
    if (!resultHasProvenanceSource(evaluationCase.result, source)) {
      reasons.push(`missing required provenance source ${source}`);
    }
  }

  if (
    evaluationCase.expectations.requireWarning
    && !resultHasWarning(evaluationCase.result)
  ) {
    reasons.push("expected partial extraction warning was not present");
  }

  if (
    evaluationCase.expectations.requirePageFailure
    && !resultHasPageFailure(evaluationCase.result)
  ) {
    reasons.push("expected page-level extraction failure was not present");
  }

  for (const code of evaluationCase.expectations.requiredFailureCodes) {
    if (!resultHasFailureCode(evaluationCase.result, code)) {
      reasons.push(`missing required extraction failure code ${code}`);
    }
  }

  for (const pageNumber of evaluationCase.expectations.requiredUnsupportedPageNumbers) {
    if (!resultHasUnsupportedPageFailure(evaluationCase.result, pageNumber)) {
      reasons.push(
        `unsupported page ${pageNumber} was not honestly represented by warning or page failure`,
      );
    }
  }

  return {
    caseId: evaluationCase.caseId,
    outcome: reasons.length === 0 ? "pass" : "fail",
    coverageRatio,
    averageConfidence,
    reasons,
  };
}

function calculateCoverageRatio(
  input: Readonly<{
    result: SyntheticResourceExtractionResult;
    expectedFragments: readonly string[];
  }>,
): number {
  if (input.expectedFragments.length === 0) {
    return 1;
  }

  const extractedText = normalizeText(extractResultText(input.result));
  const coveredFragments = input.expectedFragments.filter((fragment) =>
    extractedText.includes(normalizeText(fragment)),
  );

  return coveredFragments.length / input.expectedFragments.length;
}

function calculateAverageConfidence(
  result: SyntheticResourceExtractionResult,
): number {
  if (result.outcome === "failed") {
    return 0;
  }

  const confidenceValues = [
    ...result.content.blocks.map((block) => block.confidence),
    ...result.content.pages.map((page) => page.confidence),
  ].filter((confidence): confidence is number => confidence !== null);

  if (confidenceValues.length === 0) {
    return 1;
  }

  return confidenceValues.reduce((sum, confidence) => sum + confidence, 0)
    / confidenceValues.length;
}

function resultHasProvenanceSource(
  result: SyntheticResourceExtractionResult,
  source: SyntheticExtractionProvenanceSource,
): boolean {
  if (result.outcome === "failed") {
    return false;
  }

  return result.content.provenance.source === source
    || result.content.pages.some((page) => page.provenance.source === source);
}

function resultHasWarning(result: SyntheticResourceExtractionResult): boolean {
  return result.outcome === "partially_extracted";
}

function resultHasPageFailure(
  result: SyntheticResourceExtractionResult,
): boolean {
  if (result.outcome === "failed") {
    return false;
  }

  return result.content.pages.some((page) => page.failure !== null);
}

function resultHasFailureCode(
  result: SyntheticResourceExtractionResult,
  code: SyntheticExtractionFailureCode,
): boolean {
  return collectFailures(result).some((failure) => failure.code === code);
}

function resultHasUnsupportedPageFailure(
  result: SyntheticResourceExtractionResult,
  pageNumber: number,
): boolean {
  return collectFailures(result).some((failure) =>
    failure.code === "unsupported_page"
    && getFailurePageNumber(failure) === pageNumber,
  );
}

function collectFailures(
  result: SyntheticResourceExtractionResult,
): readonly SyntheticExtractionFailure[] {
  if (result.outcome === "failed") {
    return [
      result.failure,
    ];
  }

  const pageFailures = result.content.pages
    .map((page) => page.failure)
    .filter((failure): failure is NonNullable<SyntheticExtractedPage["failure"]> =>
      failure !== null,
    );

  if (result.outcome === "partially_extracted") {
    return [
      result.warning,
      ...pageFailures,
    ];
  }

  return pageFailures;
}

function getFailurePageNumber(
  failure: SyntheticExtractionFailure,
): number | null {
  if ("pageNumber" in failure && typeof failure.pageNumber === "number") {
    return failure.pageNumber;
  }

  return null;
}

function extractResultText(result: SyntheticResourceExtractionResult): string {
  if (result.outcome === "failed") {
    return "";
  }

  return [
    ...result.content.blocks.map((block) => block.text),
    ...result.content.pages.map((page) => page.text),
  ].join(" ");
}

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ");
}

function formatMetric(value: number): string {
  return value.toFixed(2);
}