import {
  createTutorGateway,
  validateGroundedAnswer,
} from "@avora/ai";
import type {
  TutorAnswerCandidate,
  TutorAnswerInvocationPort,
  TutorGatewayResponse,
} from "@avora/ai";

import {
  createDishonestInsufficientContextResponse,
  createInsufficientScopedSearchResult,
  createSufficientScopedSearchResult,
  createSyntheticTutorQuery,
  createUnsupportedTutorAnswerCandidate,
  createUnresolvedCitationTutorAnswerCandidate,
  createValidTutorAnswerCandidate,
  tutorGroundingEvalCases,
} from "./tutor-grounding.fixture.js";
import type {
  TutorGroundingEvalCase,
  TutorGroundingExpectedOutcome,
} from "./tutor-grounding.fixture.js";

export class TutorGroundingGateFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "TutorGroundingGateFailure";
  }
}

type GateOutcome = TutorGroundingExpectedOutcome;

export async function runTutorGroundingGate(
  cases: readonly TutorGroundingEvalCase[] = tutorGroundingEvalCases,
): Promise<void> {
  if (cases.length === 0) {
    throw new TutorGroundingGateFailure(
      "tutor-grounding",
      "gate has no cases and must fail closed",
    );
  }

  for (const evaluationCase of cases) {
    const outcome = await runTutorGroundingCase(evaluationCase);

    if (outcome !== evaluationCase.expectedOutcome) {
      throw new TutorGroundingGateFailure(
        evaluationCase.caseId,
        `expected ${evaluationCase.expectedOutcome} but received ${outcome}`,
      );
    }
  }
}

async function runTutorGroundingCase(
  evaluationCase: TutorGroundingEvalCase,
): Promise<GateOutcome> {
  switch (evaluationCase.caseId) {
    case "tutor-grounding-valid-answer-001":
      return evaluateGroundedAnswerResponse(
        await answerWithCandidate(createValidTutorAnswerCandidate()),
      );

    case "tutor-grounding-unsupported-content-001":
      return evaluateGroundedAnswerResponse(
        await answerWithCandidate(createUnsupportedTutorAnswerCandidate()),
      );

    case "tutor-citation-valid-001":
      return evaluateCitationBehavior(
        await answerWithCandidate(createValidTutorAnswerCandidate()),
      );

    case "tutor-citation-unresolved-001":
      return evaluateCitationBehavior(
        await answerWithCandidate(createUnresolvedCitationTutorAnswerCandidate()),
      );

    case "tutor-insufficiency-honest-001":
      return evaluateInsufficiencyHonesty(await answerWithInsufficientRetrieval());

    case "tutor-insufficiency-dishonest-answer-001":
      return evaluateInsufficiencyHonesty(
        createDishonestInsufficientContextResponse(),
      );

    case "tutor-api-unresolved-citation-001":
      return evaluateNoUnresolvedCitationShown(
        await answerWithCandidate(createUnresolvedCitationTutorAnswerCandidate()),
      );

    default:
      throw new TutorGroundingGateFailure(
        evaluationCase.caseId,
        "case is not implemented by the tutor grounding gate",
      );
  }
}

async function answerWithCandidate(
  candidate: TutorAnswerCandidate,
): Promise<TutorGatewayResponse> {
  const gateway = createTutorGateway({
    retrievalSearch: {
      search: async () => createSufficientScopedSearchResult(),
    },
    tutorAnswerInvocation: createDeterministicTutorAnswerInvocation(candidate),
    defaults: {
      maxChunks: 4,
      minChunkCount: 1,
      qualityTier: "standard",
    },
  });

  return gateway.answerTutorQuery(createSyntheticTutorQuery());
}

async function answerWithInsufficientRetrieval(): Promise<TutorGatewayResponse> {
  let invocationCalled = false;

  const gateway = createTutorGateway({
    retrievalSearch: {
      search: async () => createInsufficientScopedSearchResult(),
    },
    tutorAnswerInvocation: {
      invokeTutorAnswer: async () => {
        invocationCalled = true;
        return {
          candidate: createValidTutorAnswerCandidate(),
        };
      },
    },
    defaults: {
      maxChunks: 4,
      minChunkCount: 1,
      qualityTier: "standard",
    },
  });

  const response = await gateway.answerTutorQuery(createSyntheticTutorQuery());

  if (invocationCalled) {
    throw new TutorGroundingGateFailure(
      "tutor-insufficiency-honest-001",
      "provider invocation was called despite insufficient retrieval context",
    );
  }

  return response;
}

function createDeterministicTutorAnswerInvocation(
  candidate: TutorAnswerCandidate,
): TutorAnswerInvocationPort {
  return {
    invokeTutorAnswer: async (input) => {
      if (input.context.allowedChunkIds.length === 0) {
        throw new TutorGroundingGateFailure(
          "tutor-answer-invocation",
          "deterministic invocation received empty grounded context",
        );
      }

      return {
        candidate,
      };
    },
  };
}

function evaluateGroundedAnswerResponse(
  response: TutorGatewayResponse,
): GateOutcome {
  if (response.status !== "answered") {
    return "fail";
  }

  const citationValidation = validateGroundedAnswer(response);

  if (!citationValidation.valid) {
    return "fail";
  }

  return answerTextIsGroundedInEvidence(response) ? "pass" : "fail";
}

function evaluateCitationBehavior(
  response: TutorGatewayResponse,
): GateOutcome {
  if (response.status !== "answered") {
    return "fail";
  }

  return validateGroundedAnswer(response).valid ? "pass" : "fail";
}

function evaluateInsufficiencyHonesty(
  response: TutorGatewayResponse,
): GateOutcome {
  if (response.status === "insufficient_context") {
    return "pass";
  }

  if (response.status === "refused") {
    return "pass";
  }

  return "fail";
}

function evaluateNoUnresolvedCitationShown(
  response: TutorGatewayResponse,
): GateOutcome {
  if (response.status !== "answered") {
    return "pass";
  }

  return validateGroundedAnswer(response).valid ? "pass" : "fail";
}

function answerTextIsGroundedInEvidence(
  response: Extract<TutorGatewayResponse, { status: "answered" }>,
): boolean {
  const evidenceText = normalizeText(
    response.context.evidence.map((chunk) => chunk.text).join(" "),
  );
  const answerClaims = splitAnswerIntoClaims(response.answerText);

  if (answerClaims.length === 0) {
    return false;
  }

  return answerClaims.every((claim) => claimIsSupportedByEvidence(
    claim,
    evidenceText,
  ));
}

function splitAnswerIntoClaims(answerText: string): readonly string[] {
  return normalizeText(answerText)
    .split(/[.;]/u)
    .map((claim) => claim.trim())
    .filter((claim) => claim.length > 0);
}

function claimIsSupportedByEvidence(
  claim: string,
  evidenceText: string,
): boolean {
  const claimTokens = tokenize(claim)
    .filter((token) => !groundingStopWords.has(token));

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
  "says",
  "note",
  "notes",
  "supplied",
  "synthetic",
  "validation",
]);