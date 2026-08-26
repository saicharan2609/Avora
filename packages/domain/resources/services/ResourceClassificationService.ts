import { randomUUID } from "node:crypto";

import type {
  IsoDateTimeString,
} from "@avora/core/time";

import type {
  StructureUnitRecord,
  SubjectRecord,
} from "../../academic/index.js";
import type {
  ClassificationContentSignal,
  ClassificationCorrectionSignal,
  ClassificationSimilaritySignal,
  ClassifyResourceInput,
} from "../contracts/index.js";
import type {
  PlacementCandidate,
  PlacementCandidateId,
  ResourcePlacementTarget,
} from "../contracts/index.js";
import type {
  PlacementConfidenceLevel,
} from "../../academic/index.js";

// Deterministic lexical scoring weights (ENG-045: named constants, not magic
// numbers). Headings carry the strongest per-token signal because they are
// the part of a student document most likely to echo the student's own
// subject/unit naming (architecture.md 19.4). Filename is a weaker,
// secondary signal. Ordinary body content is the weakest per-token signal —
// it is noisier than a heading but still legitimate evidence when it is the
// only signal available (e.g. a resource with no distinct headings).
// Subject-code matches are the single strongest *lexical* signal available
// because a subject code (e.g. a course code) is short, distinctive, and
// rarely appears by accident.
//
// architecture.md 19.4 separately names "extracted content similarity to
// existing subject corpora" the strongest signal overall, "once a workspace
// has material" — i.e. it only exists once the student has other indexed,
// already-placed resources to compare against, unlike the lexical signals
// above which work from the very first upload. SIMILARITY_MATCH_WEIGHT is
// per matched nearest-neighbor chunk (already ranked by the retrieval
// layer), capped at SIMILARITY_MATCH_MAX_MATCHES so a handful of strong,
// consistent corpus matches can reach "high" confidence alone, matching
// that framing, while a single noisy match cannot.
const HEADING_TOKEN_WEIGHT = 3;
const BODY_CONTENT_TOKEN_WEIGHT = 1;
const FILENAME_TOKEN_WEIGHT = 2;
const SUBJECT_CODE_MATCH_WEIGHT = 6;
const SIMILARITY_MATCH_WEIGHT = 2;
const SIMILARITY_MATCH_MAX_MATCHES = 5;
const CORRECTION_PRIOR_WEIGHT_PER_MATCH = 1;
const CORRECTION_PRIOR_MAX_BOOST = 3;
const MINIMUM_TOKEN_LENGTH = 3;

// Score thresholds mapping a lexical evidence score to a placement
// confidence level (AD-22, PRD OQ-02). This mapping is an internal,
// versioned classifier heuristic (governed by classificationStrategyVersion)
// and is distinct from PlacementPolicy's separate, already-existing
// confidence-level -> decision mapping (packages/domain/resources/policies).
// This service never decides ask-vs-assume itself; it only ever reports a
// confidence level, and PlacementPolicy (unmodified) decides what happens
// next. A score of zero never produces a candidate at all: per
// docs/MASTER-ROADMAP.md Group 6 explicit non-goal, absence of evidence
// must never manufacture a placement.
const HIGH_CONFIDENCE_SCORE_THRESHOLD = 8;
const MEDIUM_CONFIDENCE_SCORE_THRESHOLD = 4;
const LOW_CONFIDENCE_SCORE_THRESHOLD = 1;

export type ClassifyResourceResult = Readonly<{
  candidate: PlacementCandidate | null;
}>;

export type ResourceClassificationService = Readonly<{
  classifyResource: (
    input: ClassifyResourceInput,
  ) => ClassifyResourceResult;
}>;

export type ResourceClassificationServiceDependencies = Readonly<{
  createCandidateId?: () => PlacementCandidateId;
  now?: () => IsoDateTimeString;
}>;

export function createResourceClassificationService(
  dependencies: ResourceClassificationServiceDependencies = {},
): ResourceClassificationService {
  const createCandidateId =
    dependencies.createCandidateId ?? defaultCreateCandidateId;
  const now = dependencies.now ?? defaultNow;

  return {
    classifyResource: (input: ClassifyResourceInput): ClassifyResourceResult => {
      const headingTokens = tokenizeSignals(input.contentSignals, "heading");
      const bodyContentTokens = tokenizeSignals(input.contentSignals, "content");
      const filenameTokens = tokenizeText(input.originalFilename);

      const allSubjects = listAllSubjects(input.academicStructureTree);
      const correctionCounts = countCorrectionsBySubject(input.correctionHistory);
      const similarityCounts = countSimilarityMatchesBySubject(input.similaritySignals);

      const ranked = allSubjects
        .map((subject) => scoreSubject({
          subject,
          headingTokens,
          bodyContentTokens,
          filenameTokens,
          correctionCounts,
          similarityCounts,
        }))
        .filter((scored) => scored.score > 0)
        .sort((left, right) => right.score - left.score);

      const best = ranked[0];

      if (best === undefined) {
        return { candidate: null };
      }

      const bestUnit = selectBestStructureUnit({
        subjectId: best.subject.subjectId,
        academicStructureTree: input.academicStructureTree,
        headingTokens,
        bodyContentTokens,
      });

      const candidate = buildCandidate({
        studentId: input.studentId,
        resourceId: input.resourceId,
        best,
        bestUnit,
        createCandidateId,
        now,
      });

      return { candidate };
    },
  };
}

type BuildCandidateInput = Readonly<{
  studentId: ClassifyResourceInput["studentId"];
  resourceId: ClassifyResourceInput["resourceId"];
  best: ScoredSubject;
  bestUnit: StructureUnitRecord | null;
  createCandidateId: () => PlacementCandidateId;
  now: () => IsoDateTimeString;
}>;

function buildCandidate(input: BuildCandidateInput): PlacementCandidate {
  const target: ResourcePlacementTarget = {
    termId: input.best.subject.termId,
    subjectId: input.best.subject.subjectId,
    structureUnitId: input.bestUnit?.structureUnitId ?? null,
  };

  const reason = describeEvidence(input.best.score, input.bestUnit !== null);

  return {
    candidateId: input.createCandidateId(),
    studentId: input.studentId,
    resourceId: input.resourceId,
    target,
    confidence: {
      level: mapScoreToConfidenceLevel(input.best.score),
      source: "system_suggested",
      reason,
    },
    provenance: input.best.contentEvidenceCount > 0 ? "resource_content" : "resource_metadata",
    reason,
    createdAt: input.now(),
  };
}

type ScoreSubjectInput = Readonly<{
  subject: SubjectRecord;
  headingTokens: ReadonlySet<string>;
  bodyContentTokens: ReadonlySet<string>;
  filenameTokens: ReadonlySet<string>;
  correctionCounts: ReadonlyMap<string, number>;
  similarityCounts: ReadonlyMap<string, number>;
}>;

type ScoredSubject = Readonly<{
  subject: SubjectRecord;
  score: number;
  // Aggregate count of content-derived evidence (heading tokens, body
  // content tokens, similarity matches, a code match) as opposed to
  // filename-only evidence — used only to pick the "resource_content" vs
  // "resource_metadata" provenance bucket, never for ranking.
  contentEvidenceCount: number;
}>;

function scoreSubject(input: ScoreSubjectInput): ScoredSubject {
  const nameTokens = tokenizeText(input.subject.displayName);
  const codeToken = input.subject.subjectCode === null
    ? null
    : normalizeToken(input.subject.subjectCode);

  const headingOverlap = countOverlap(nameTokens, input.headingTokens);
  const bodyContentOverlap = countOverlap(nameTokens, input.bodyContentTokens);
  const filenameOverlap = countOverlap(nameTokens, input.filenameTokens);
  const codeMatched =
    codeToken !== null
    && (
      input.headingTokens.has(codeToken)
      || input.bodyContentTokens.has(codeToken)
      || input.filenameTokens.has(codeToken)
    );

  const similarityMatches = Math.min(
    input.similarityCounts.get(input.subject.subjectId) ?? 0,
    SIMILARITY_MATCH_MAX_MATCHES,
  );

  let score =
    headingOverlap * HEADING_TOKEN_WEIGHT
    + bodyContentOverlap * BODY_CONTENT_TOKEN_WEIGHT
    + filenameOverlap * FILENAME_TOKEN_WEIGHT
    + (codeMatched ? SUBJECT_CODE_MATCH_WEIGHT : 0)
    + similarityMatches * SIMILARITY_MATCH_WEIGHT;

  if (score > 0) {
    const priorMatches = input.correctionCounts.get(input.subject.subjectId) ?? 0;
    const boost = Math.min(
      priorMatches * CORRECTION_PRIOR_WEIGHT_PER_MATCH,
      CORRECTION_PRIOR_MAX_BOOST,
    );

    score += boost;
  }

  return {
    subject: input.subject,
    score,
    contentEvidenceCount: headingOverlap + bodyContentOverlap + similarityMatches + (codeMatched ? 1 : 0),
  };
}

type SelectBestStructureUnitInput = Readonly<{
  subjectId: SubjectRecord["subjectId"];
  academicStructureTree: ClassifyResourceInput["academicStructureTree"];
  headingTokens: ReadonlySet<string>;
  bodyContentTokens: ReadonlySet<string>;
}>;

function selectBestStructureUnit(
  input: SelectBestStructureUnitInput,
): StructureUnitRecord | null {
  const units = listStructureUnitsForSubject(
    input.academicStructureTree,
    input.subjectId,
  );

  let best: StructureUnitRecord | null = null;
  let bestScore = 0;

  for (const unit of units) {
    const titleTokens = tokenizeText(unit.title);
    const overlap =
      countOverlap(titleTokens, input.headingTokens) * HEADING_TOKEN_WEIGHT
      + countOverlap(titleTokens, input.bodyContentTokens) * BODY_CONTENT_TOKEN_WEIGHT;

    if (overlap > bestScore) {
      bestScore = overlap;
      best = unit;
    }
  }

  return best;
}

function listAllSubjects(
  academicStructureTree: ClassifyResourceInput["academicStructureTree"],
): readonly SubjectRecord[] {
  return academicStructureTree.terms.flatMap((term) =>
    term.subjects.map((subjectTree) => subjectTree.subject));
}

function listStructureUnitsForSubject(
  academicStructureTree: ClassifyResourceInput["academicStructureTree"],
  subjectId: SubjectRecord["subjectId"],
): readonly StructureUnitRecord[] {
  const units: StructureUnitRecord[] = [];

  for (const term of academicStructureTree.terms) {
    for (const subjectTree of term.subjects) {
      if (subjectTree.subject.subjectId !== subjectId) {
        continue;
      }

      collectStructureUnitNodes(subjectTree.units, units);
    }
  }

  return units;
}

function collectStructureUnitNodes(
  nodes: ClassifyResourceInput["academicStructureTree"]["terms"][number]["subjects"][number]["units"],
  into: StructureUnitRecord[],
): void {
  for (const node of nodes) {
    into.push(node.unit);
    collectStructureUnitNodes(node.children, into);
  }
}

function countCorrectionsBySubject(
  correctionHistory: readonly ClassificationCorrectionSignal[],
): ReadonlyMap<string, number> {
  const counts = new Map<string, number>();

  for (const correction of correctionHistory) {
    const subjectId = correction.correctedTarget.subjectId;

    counts.set(subjectId, (counts.get(subjectId) ?? 0) + 1);
  }

  return counts;
}

function countSimilarityMatchesBySubject(
  similaritySignals: readonly ClassificationSimilaritySignal[],
): ReadonlyMap<string, number> {
  const counts = new Map<string, number>();

  for (const signal of similaritySignals) {
    counts.set(signal.subjectId, (counts.get(signal.subjectId) ?? 0) + 1);
  }

  return counts;
}

function tokenizeSignals(
  signals: readonly ClassificationContentSignal[],
  kind: ClassificationContentSignal["kind"],
): ReadonlySet<string> {
  const tokens = new Set<string>();

  for (const signal of signals) {
    if (signal.kind !== kind) {
      continue;
    }

    for (const token of tokenizeText(signal.text)) {
      tokens.add(token);
    }
  }

  return tokens;
}

function tokenizeText(text: string): ReadonlySet<string> {
  const tokens = text
    .toLowerCase()
    .split(/[^a-z0-9]+/u)
    .filter((token) => token.length >= MINIMUM_TOKEN_LENGTH);

  return new Set(tokens);
}

function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/gu, "");
}

function countOverlap(
  left: ReadonlySet<string>,
  right: ReadonlySet<string>,
): number {
  let overlap = 0;

  for (const token of left) {
    if (right.has(token)) {
      overlap += 1;
    }
  }

  return overlap;
}

function mapScoreToConfidenceLevel(score: number): PlacementConfidenceLevel {
  if (score >= HIGH_CONFIDENCE_SCORE_THRESHOLD) {
    return "high";
  }

  if (score >= MEDIUM_CONFIDENCE_SCORE_THRESHOLD) {
    return "medium";
  }

  if (score >= LOW_CONFIDENCE_SCORE_THRESHOLD) {
    return "low";
  }

  return "unknown";
}

function describeEvidence(score: number, matchedStructureUnit: boolean): string {
  const level = mapScoreToConfidenceLevel(score);
  const scopeDescription = matchedStructureUnit
    ? "subject and structure unit"
    : "subject";

  return `Deterministic classifier matched ${scopeDescription} evidence at ${level} confidence.`;
}

function defaultCreateCandidateId(): PlacementCandidateId {
  return randomUUID() as PlacementCandidateId;
}

function defaultNow(): IsoDateTimeString {
  return new Date().toISOString() as IsoDateTimeString;
}
