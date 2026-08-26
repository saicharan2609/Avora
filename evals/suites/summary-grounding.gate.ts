import {
  createSummaryGateway,
} from "@avora/ai";
import type {
  SummaryCandidate,
  SummaryGatewayResponse,
  SummaryInvocationPort,
} from "@avora/ai";

import {
  createEmptyHeadingTitleSummaryCandidate,
  createOtherResourceCitationSummaryCandidate,
  createSingleChunkFixture,
  createSingleChunkSufficientSummaryCandidate,
  createSyntheticSummaryQuery,
  createTwoChunkFixture,
  createUnresolvedCitationSummaryCandidate,
  createUnsupportedSummaryCandidate,
  createValidSummaryCandidate,
  summaryGroundingEvalCases,
} from "./summary-grounding.fixture.js";
import type {
  SummaryGroundingEvalCase,
  SummaryGroundingExpectedOutcome,
} from "./summary-grounding.fixture.js";

export class SummaryGroundingGateFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "SummaryGroundingGateFailure";
  }
}

type GateOutcome = SummaryGroundingExpectedOutcome;

export async function runSummaryGroundingGate(
  cases: readonly SummaryGroundingEvalCase[] = summaryGroundingEvalCases,
): Promise<void> {
  if (cases.length === 0) {
    throw new SummaryGroundingGateFailure(
      "summary-grounding",
      "gate has no cases and must fail closed",
    );
  }

  for (const evaluationCase of cases) {
    const outcome = await runSummaryGroundingCase(evaluationCase);

    if (outcome !== evaluationCase.expectedOutcome) {
      throw new SummaryGroundingGateFailure(
        evaluationCase.caseId,
        `expected ${evaluationCase.expectedOutcome} but received ${outcome}`,
      );
    }
  }
}

type SummaryGroundingCaseHandler = () => Promise<GateOutcome>;

const summaryGroundingCaseHandlers: Readonly<
  Record<string, SummaryGroundingCaseHandler>
> = {
  "summary-groundedness-valid-001": async () =>
    evaluateGroundedness(
      await generateWithCandidate(createValidSummaryCandidate(), createSingleChunkFixture()),
    ),

  "summary-groundedness-unsupported-001": async () =>
    evaluateGroundedness(
      await generateWithCandidate(createUnsupportedSummaryCandidate(), createSingleChunkFixture()),
    ),

  // A summary fully grounded and validly cited using only one of several
  // supplied chunks must be accepted. The governing requirement is
  // citation validity/locality (see the citation_validity and
  // citation_locality cases below), not exhaustive coverage of every
  // chunk the resource happens to have — no governing document requires
  // a summary to cite more than one chunk merely because more exist.
  "summary-single-chunk-sufficiency-001": async () =>
    evaluateSingleChunkSufficiency(
      await generateWithCandidate(createSingleChunkSufficientSummaryCandidate(), createTwoChunkFixture()),
    ),

  "summary-coherence-structure-001": async () =>
    evaluateCoherenceStructure(
      await generateWithCandidate(createValidSummaryCandidate(), createSingleChunkFixture()),
    ),

  "summary-coherence-structure-empty-heading-001": async () =>
    evaluateCoherenceStructure(
      await generateWithCandidate(createEmptyHeadingTitleSummaryCandidate(), createSingleChunkFixture()),
    ),

  "summary-citation-valid-001": async () =>
    evaluateCitationBehavior(
      await generateWithCandidate(createValidSummaryCandidate(), createSingleChunkFixture()),
    ),

  "summary-citation-unresolved-001": async () =>
    evaluateCitationBehavior(
      await generateWithCandidate(createUnresolvedCitationSummaryCandidate(), createSingleChunkFixture()),
    ),

  "summary-citation-locality-other-resource-001": async () =>
    evaluateCitationBehavior(
      await generateWithCandidate(createOtherResourceCitationSummaryCandidate(), createSingleChunkFixture()),
    ),

  "summary-fail-closed-no-chunks-001": async () => evaluateFailClosedNoChunks(),
};

async function runSummaryGroundingCase(
  evaluationCase: SummaryGroundingEvalCase,
): Promise<GateOutcome> {
  const handler = summaryGroundingCaseHandlers[evaluationCase.caseId];

  if (handler === undefined) {
    throw new SummaryGroundingGateFailure(
      evaluationCase.caseId,
      "case is not implemented by the summary grounding gate",
    );
  }

  return handler();
}

async function generateWithCandidate(
  candidate: SummaryCandidate,
  chunks: ReturnType<typeof createSingleChunkFixture>,
): Promise<SummaryGatewayResponse> {
  const gateway = createSummaryGateway({
    chunkRetrieval: {
      listRetrievalChunksByResource: async () => chunks,
    },
    summaryInvocation: createDeterministicSummaryInvocation(candidate),
    defaults: {
      minChunkCount: 1,
      qualityTier: "standard",
    },
  });

  return gateway.generateResourceSummary(createSyntheticSummaryQuery());
}

async function evaluateFailClosedNoChunks(): Promise<GateOutcome> {
  let invocationCalled = false;

  const gateway = createSummaryGateway({
    chunkRetrieval: {
      listRetrievalChunksByResource: async () => [],
    },
    summaryInvocation: {
      invokeSummaryGeneration: async () => {
        invocationCalled = true;
        return { candidate: createValidSummaryCandidate() };
      },
    },
    defaults: {
      minChunkCount: 1,
      qualityTier: "standard",
    },
  });

  const response = await gateway.generateResourceSummary(createSyntheticSummaryQuery());

  if (invocationCalled) {
    return "fail";
  }

  return response.status === "insufficient_evidence" ? "pass" : "fail";
}

function createDeterministicSummaryInvocation(
  candidate: SummaryCandidate,
): SummaryInvocationPort {
  return {
    invokeSummaryGeneration: async (input) => {
      if (input.context.allowedChunkIds.length === 0) {
        throw new SummaryGroundingGateFailure(
          "summary-invocation",
          "deterministic invocation received empty grounded context",
        );
      }

      return { candidate };
    },
  };
}

function evaluateGroundedness(response: SummaryGatewayResponse): GateOutcome {
  if (response.status !== "generated") {
    return "fail";
  }

  return summaryIsGroundedInEvidence(response) ? "pass" : "fail";
}

function evaluateSingleChunkSufficiency(
  response: SummaryGatewayResponse,
): GateOutcome {
  if (response.status !== "generated") {
    return "fail";
  }

  // Must be accepted with exactly the one valid citation it actually used —
  // acceptance must not depend on how many other chunks were supplied.
  return response.citations.length === 1 ? "pass" : "fail";
}

function evaluateCoherenceStructure(response: SummaryGatewayResponse): GateOutcome {
  return response.status === "generated" ? "pass" : "fail";
}

function evaluateCitationBehavior(response: SummaryGatewayResponse): GateOutcome {
  return response.status === "generated" ? "pass" : "fail";
}

function summaryIsGroundedInEvidence(
  response: Extract<SummaryGatewayResponse, { status: "generated" }>,
): boolean {
  const evidenceText = normalizeText(
    response.context.evidence.map((chunk) => chunk.text).join(" "),
  );

  const points = response.body.headings.flatMap((heading) => heading.points);

  if (points.length === 0) {
    return false;
  }

  return points.every((point) => claimIsSupportedByEvidence(point, evidenceText));
}

function claimIsSupportedByEvidence(claim: string, evidenceText: string): boolean {
  const claimTokens = tokenize(claim).filter((token) => !groundingStopWords.has(token));

  if (claimTokens.length === 0) {
    return false;
  }

  return claimTokens.every((token) => evidenceText.includes(token));
}

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s.;]/gu, " ")
    .replace(/\s+/g, " ");
}

function tokenize(value: string): readonly string[] {
  return normalizeText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length > 2);
}

const groundingStopWords = new Set([
  "the",
  "and",
  "for",
  "that",
  "this",
  "with",
  "from",
  "each",
  "node",
  "synthetic",
]);
