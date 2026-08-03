import type { CitationValidityCase } from "./citation-validity.fixture.js";

export type CitationValidityOutcome = "deliver" | "block";

export class CitationValidityGateFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "CitationValidityGateFailure";
  }
}

function evaluateCitationValidity(evaluationCase: CitationValidityCase): CitationValidityOutcome {
  if (evaluationCase.emittedCitations.length === 0) {
    return "block";
  }

  const suppliedChunks = new Map(
    evaluationCase.suppliedChunks.map((chunk) => [chunk.chunkId, chunk]),
  );

  for (const citation of evaluationCase.emittedCitations) {
    const resolvedChunk = suppliedChunks.get(citation.chunkId);

    if (resolvedChunk === undefined) {
      return "block";
    }

    if (resolvedChunk.locator.length === 0) {
      return "block";
    }
  }

  return "deliver";
}

export function runCitationValidityGate(cases: readonly CitationValidityCase[]): void {
  if (cases.length === 0) {
    throw new CitationValidityGateFailure(
      "citation-validity",
      "gate has no cases and must fail closed",
    );
  }

  for (const evaluationCase of cases) {
    const outcome = evaluateCitationValidity(evaluationCase);

    if (outcome !== evaluationCase.expectedOutcome) {
      throw new CitationValidityGateFailure(
        evaluationCase.caseId,
        `expected ${evaluationCase.expectedOutcome} but received ${outcome}`,
      );
    }
  }
}