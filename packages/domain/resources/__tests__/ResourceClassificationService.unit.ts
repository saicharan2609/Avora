import type { StudentId } from "@avora/core/identity";

import type {
  AcademicStructureTree,
  StructureUnitRecord,
  SubjectRecord,
} from "../../academic/index.js";
import type {
  ClassificationContentSignal,
  ClassificationCorrectionSignal,
  ClassificationSimilaritySignal,
  ClassifyResourceInput,
} from "../contracts/index.js";
import {
  createResourceClassificationService,
} from "../services/ResourceClassificationService.js";

class ResourceClassificationServiceUnitFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "ResourceClassificationServiceUnitFailure";
  }
}

function assert(condition: boolean, caseId: string, reason: string): asserts condition {
  if (!condition) {
    throw new ResourceClassificationServiceUnitFailure(caseId, reason);
  }
}

const studentId = "student-1" as StudentId;

function buildSubject(overrides: Partial<SubjectRecord> = {}): SubjectRecord {
  return {
    subjectId: "subject-data-structures",
    studentId,
    termId: "term-1",
    displayName: "Data Structures",
    subjectCode: "CS201",
    description: null,
    lifecycleState: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as SubjectRecord;
}

function buildUnit(
  subjectId: SubjectRecord["subjectId"],
  overrides: Partial<StructureUnitRecord> = {},
): StructureUnitRecord {
  return {
    structureUnitId: "unit-linked-lists",
    studentId,
    termId: "term-1",
    subjectId,
    parentUnitId: null,
    title: "Linked Lists",
    description: null,
    unitKind: "topic",
    source: "student_declared",
    sortOrder: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as StructureUnitRecord;
}

function buildTree(
  subject: SubjectRecord,
  units: readonly StructureUnitRecord[] = [],
): AcademicStructureTree {
  return {
    terms: [
      {
        term: {
          termId: subject.termId,
          studentId,
          label: "Term 1",
          institutionName: null,
          startsOn: null,
          endsOn: null,
          lifecycleState: "active",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        subjects: [
          {
            subject,
            units: units.map((unit) => ({ unit, children: [] })),
          },
        ],
      },
    ],
  } as unknown as AcademicStructureTree;
}

function buildInput(overrides: Partial<ClassifyResourceInput>): ClassifyResourceInput {
  const subject = buildSubject();

  return {
    studentId,
    resourceId: "resource-1" as ClassifyResourceInput["resourceId"],
    classificationStrategyVersion: "classifier.v1",
    originalFilename: "notes.pdf",
    contentSignals: [],
    academicStructureTree: buildTree(subject),
    correctionHistory: [],
    similaritySignals: [],
    ...overrides,
  };
}

function runStrongHeadingAndCodeMatchProducesHighConfidenceCandidateCase(): void {
  const caseId = "resource-classification-strong-heading-and-code-match-is-high-confidence";
  const subject = buildSubject();
  const unit = buildUnit(subject.subjectId);
  const service = createResourceClassificationService();

  const contentSignals: readonly ClassificationContentSignal[] = [
    { kind: "heading", text: "CS201 Data Structures - Linked Lists" },
  ];

  const result = service.classifyResource(buildInput({
    academicStructureTree: buildTree(subject, [unit]),
    contentSignals,
  }));

  assert(result.candidate !== null, caseId, "expected a candidate to be produced");
  assert(
    result.candidate?.target.subjectId === subject.subjectId,
    caseId,
    "expected the candidate to target the matching subject",
  );
  assert(
    result.candidate?.target.structureUnitId === unit.structureUnitId,
    caseId,
    "expected the candidate to target the matching structure unit",
  );
  assert(
    result.candidate?.confidence.level === "high",
    caseId,
    `expected high confidence, received ${String(result.candidate?.confidence.level)}`,
  );
  assert(
    result.candidate?.confidence.source === "system_suggested",
    caseId,
    "expected confidence source system_suggested, never student",
  );
  assert(
    result.candidate?.provenance === "resource_content",
    caseId,
    "expected provenance resource_content when a heading matched",
  );
}

function runNoEvidenceProducesNoCandidateCase(): void {
  const caseId = "resource-classification-no-evidence-produces-no-candidate";
  const subject = buildSubject();
  const service = createResourceClassificationService();

  const result = service.classifyResource(buildInput({
    academicStructureTree: buildTree(subject),
    contentSignals: [
      { kind: "heading", text: "Unrelated Astrophysics Lecture Notes" },
    ],
    originalFilename: "random.pdf",
  }));

  assert(
    result.candidate === null,
    caseId,
    "expected zero evidence to produce zero candidates, never a forced placement",
  );
}

function runFilenameOnlyMatchProducesMetadataProvenanceCase(): void {
  const caseId = "resource-classification-filename-only-match-is-metadata-provenance";
  const subject = buildSubject({ subjectCode: null });
  const service = createResourceClassificationService();

  const result = service.classifyResource(buildInput({
    academicStructureTree: buildTree(subject),
    contentSignals: [],
    originalFilename: "data-structures-syllabus.pdf",
  }));

  assert(result.candidate !== null, caseId, "expected filename tokens alone to produce a candidate");
  assert(
    result.candidate?.provenance === "resource_metadata",
    caseId,
    "expected provenance resource_metadata when only the filename matched",
  );
  assert(
    result.candidate?.confidence.level !== "high",
    caseId,
    "expected filename-only evidence to fall short of high confidence",
  );
}

function runCorrectionPriorBoostsAmbiguousSubjectWithoutBeingSoleEvidenceCase(): void {
  const caseId =
    "resource-classification-correction-prior-boosts-ambiguous-subject-without-being-sole-evidence";
  const subjectA = buildSubject({
    subjectId: "subject-foundations" as SubjectRecord["subjectId"],
    displayName: "Foundations",
    subjectCode: "CS100",
  });
  const subjectB = buildSubject({
    subjectId: "subject-systems" as SubjectRecord["subjectId"],
    displayName: "Systems",
    subjectCode: "CS200",
  });
  const service = createResourceClassificationService();

  const tree: AcademicStructureTree = {
    terms: [
      {
        term: buildTree(subjectA).terms[0]!.term,
        subjects: [
          { subject: subjectA, units: [] },
          { subject: subjectB, units: [] },
        ],
      },
    ],
  };

  const correctionHistory: readonly ClassificationCorrectionSignal[] = [
    {
      correctedTarget: {
        termId: subjectB.termId,
        subjectId: subjectB.subjectId,
        structureUnitId: null,
      },
    },
  ];

  const contentSignals: readonly ClassificationContentSignal[] = [
    { kind: "heading", text: "Foundations Systems Overview" },
  ];

  const withoutHistory = service.classifyResource(buildInput({
    academicStructureTree: tree,
    contentSignals,
    correctionHistory: [],
  }));

  const withHistory = service.classifyResource(buildInput({
    academicStructureTree: tree,
    contentSignals,
    correctionHistory,
  }));

  assert(
    withoutHistory.candidate !== null && withHistory.candidate !== null,
    caseId,
    "expected both runs to produce a candidate from lexical evidence alone",
  );
  assert(
    withoutHistory.candidate?.target.subjectId === subjectA.subjectId,
    caseId,
    "expected the tied lexical score to resolve deterministically by evidence order without a correction prior",
  );
  assert(
    withHistory.candidate?.target.subjectId === subjectB.subjectId,
    caseId,
    "expected the correction-history prior to tie-break toward the previously corrected subject",
  );

  const noLexicalEvidence = service.classifyResource(buildInput({
    academicStructureTree: buildTree(subjectB),
    contentSignals: [],
    originalFilename: "notes.pdf",
    correctionHistory,
  }));

  assert(
    noLexicalEvidence.candidate === null,
    caseId,
    "expected the correction prior alone, with zero lexical evidence, to never produce a candidate",
  );
}

function runSimilarityMatchesAloneProduceHighConfidenceContentCandidateCase(): void {
  const caseId =
    "resource-classification-similarity-matches-alone-produce-high-confidence-content-candidate";
  const subject = buildSubject({
    subjectId: "subject-quantum" as SubjectRecord["subjectId"],
    displayName: "Quantum Field Theory",
    subjectCode: "PHY470",
  });
  const service = createResourceClassificationService();

  // Heading/filename share zero tokens with the subject name or code —
  // only nearest-neighbor corpus matches point at this subject.
  const similaritySignals: readonly ClassificationSimilaritySignal[] = [
    { subjectId: subject.subjectId, rank: 1 },
    { subjectId: subject.subjectId, rank: 2 },
    { subjectId: subject.subjectId, rank: 3 },
    { subjectId: subject.subjectId, rank: 4 },
    { subjectId: subject.subjectId, rank: 5 },
  ];

  const result = service.classifyResource(buildInput({
    academicStructureTree: buildTree(subject),
    contentSignals: [
      { kind: "heading", text: "Untitled Scan" },
    ],
    originalFilename: "img-8823.pdf",
    similaritySignals,
  }));

  assert(
    result.candidate !== null,
    caseId,
    "expected corpus similarity alone, with no lexical match, to still produce a candidate",
  );
  assert(
    result.candidate?.target.subjectId === subject.subjectId,
    caseId,
    "expected the candidate to target the subject the corpus matches pointed at",
  );
  assert(
    result.candidate?.confidence.level === "high",
    caseId,
    `expected 5 capped similarity matches to reach high confidence, received ${String(result.candidate?.confidence.level)}`,
  );
  assert(
    result.candidate?.provenance === "resource_content",
    caseId,
    "expected corpus-similarity evidence to be treated as resource_content provenance",
  );
}

function runSimilarityMatchesAreCappedCase(): void {
  const caseId = "resource-classification-similarity-matches-are-capped";
  const subject = buildSubject({
    subjectId: "subject-capped" as SubjectRecord["subjectId"],
    displayName: "Capped Subject",
    subjectCode: null,
  });
  const service = createResourceClassificationService();

  const manyMatches: readonly ClassificationSimilaritySignal[] = Array.from(
    { length: 50 },
    (_unused, index) => ({ subjectId: subject.subjectId, rank: index + 1 }),
  );

  const cappedResult = service.classifyResource(buildInput({
    academicStructureTree: buildTree(subject),
    contentSignals: [],
    originalFilename: "img.pdf",
    similaritySignals: manyMatches,
  }));

  const fiveMatchesResult = service.classifyResource(buildInput({
    academicStructureTree: buildTree(subject),
    contentSignals: [],
    originalFilename: "img.pdf",
    similaritySignals: manyMatches.slice(0, 5),
  }));

  assert(
    cappedResult.candidate?.confidence.level === fiveMatchesResult.candidate?.confidence.level,
    caseId,
    "expected similarity matches beyond the cap to have no further effect on confidence",
  );
}

function main(): void {
  runStrongHeadingAndCodeMatchProducesHighConfidenceCandidateCase();
  runNoEvidenceProducesNoCandidateCase();
  runFilenameOnlyMatchProducesMetadataProvenanceCase();
  runCorrectionPriorBoostsAmbiguousSubjectWithoutBeingSoleEvidenceCase();
  runSimilarityMatchesAloneProduceHighConfidenceContentCandidateCase();
  runSimilarityMatchesAreCappedCase();
}

main();
