import type {
  AcademicStructureTree,
} from "@avora/domain/academic";
import type {
  ClassificationContentSignal,
  ClassificationCorrectionSignal,
} from "@avora/domain/resources";

// Synthetic fixtures only (ENG-342): no production data, no real student
// content, no real academic material. Every subject/unit name below is an
// invented placeholder, not a real institution's curriculum.

export type ResourceClassificationExpectedOutcome = Readonly<{
  subjectId: string;
  structureUnitId: string | null;
}> | null;

export type ResourceClassificationQualityCase = Readonly<{
  caseId: string;
  originalFilename: string;
  contentSignals: readonly ClassificationContentSignal[];
  academicStructureTree: AcademicStructureTree;
  correctionHistory: readonly ClassificationCorrectionSignal[];
  expectedOutcome: ResourceClassificationExpectedOutcome;
}>;

function subject(id: string, displayName: string, code: string | null): AcademicStructureTree["terms"][number]["subjects"][number]["subject"] {
  return {
    subjectId: id,
    studentId: "student-eval",
    termId: "term-eval",
    displayName,
    subjectCode: code,
    description: null,
    lifecycleState: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  } as AcademicStructureTree["terms"][number]["subjects"][number]["subject"];
}

function unit(
  id: string,
  subjectId: string,
  title: string,
): AcademicStructureTree["terms"][number]["subjects"][number]["units"][number]["unit"] {
  return {
    structureUnitId: id,
    studentId: "student-eval",
    termId: "term-eval",
    subjectId,
    parentUnitId: null,
    title,
    description: null,
    unitKind: "topic",
    source: "student_declared",
    sortOrder: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  } as AcademicStructureTree["terms"][number]["subjects"][number]["units"][number]["unit"];
}

function singleSubjectTree(
  subjectId: string,
  displayName: string,
  code: string | null,
  units: readonly { id: string; title: string }[] = [],
): AcademicStructureTree {
  return {
    terms: [
      {
        term: {
          termId: "term-eval",
          studentId: "student-eval",
          label: "Eval Term",
          institutionName: null,
          startsOn: null,
          endsOn: null,
          lifecycleState: "active",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        subjects: [
          {
            subject: subject(subjectId, displayName, code),
            units: units.map((entry) => ({
              unit: unit(entry.id, subjectId, entry.title),
              children: [],
            })),
          },
        ],
      },
    ],
  } as unknown as AcademicStructureTree;
}

function multiSubjectTree(
  entries: readonly { id: string; displayName: string; code: string | null }[],
): AcademicStructureTree {
  return {
    terms: [
      {
        term: {
          termId: "term-eval",
          studentId: "student-eval",
          label: "Eval Term",
          institutionName: null,
          startsOn: null,
          endsOn: null,
          lifecycleState: "active",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        subjects: entries.map((entry) => ({
          subject: subject(entry.id, entry.displayName, entry.code),
          units: [],
        })),
      },
    ],
  } as unknown as AcademicStructureTree;
}

export const resourceClassificationQualityCases: readonly ResourceClassificationQualityCase[] = [
  {
    caseId: "classification-eval-syllabus-heading-and-code",
    originalFilename: "syllabus.pdf",
    contentSignals: [
      { kind: "heading", text: "PHY210 Thermodynamics Course Syllabus" },
    ],
    academicStructureTree: singleSubjectTree("subject-thermo", "Thermodynamics", "PHY210"),
    correctionHistory: [],
    expectedOutcome: { subjectId: "subject-thermo", structureUnitId: null },
  },
  {
    caseId: "classification-eval-scanned-heading-matches-subject-name",
    originalFilename: "week3-scan.pdf",
    contentSignals: [
      { kind: "heading", text: "Organic Chemistry - Reaction Mechanisms" },
    ],
    academicStructureTree: singleSubjectTree("subject-orgchem", "Organic Chemistry", "CHEM220"),
    correctionHistory: [],
    expectedOutcome: { subjectId: "subject-orgchem", structureUnitId: null },
  },
  {
    caseId: "classification-eval-structure-unit-disambiguation",
    originalFilename: "notes.pdf",
    contentSignals: [
      { kind: "heading", text: "Signals and Systems - Fourier Transform" },
    ],
    academicStructureTree: singleSubjectTree("subject-signals", "Signals and Systems", "EE310", [
      { id: "unit-laplace", title: "Laplace Transform" },
      { id: "unit-fourier", title: "Fourier Transform" },
      { id: "unit-sampling", title: "Sampling Theory" },
    ]),
    correctionHistory: [],
    expectedOutcome: { subjectId: "subject-signals", structureUnitId: "unit-fourier" },
  },
  {
    caseId: "classification-eval-two-subjects-code-disambiguates",
    originalFilename: "handout.pdf",
    contentSignals: [
      { kind: "heading", text: "ME150 Fluid Mechanics Lab Handout" },
    ],
    academicStructureTree: multiSubjectTree([
      { id: "subject-fluids", displayName: "Fluid Mechanics", code: "ME150" },
      { id: "subject-solids", displayName: "Solid Mechanics", code: "ME160" },
    ]),
    correctionHistory: [],
    expectedOutcome: { subjectId: "subject-fluids", structureUnitId: null },
  },
  {
    caseId: "classification-eval-two-subjects-heading-margin-disambiguates",
    originalFilename: "lecture.pdf",
    contentSignals: [
      { kind: "heading", text: "Microeconomics Supply and Demand Elasticity Lecture" },
    ],
    academicStructureTree: multiSubjectTree([
      { id: "subject-micro", displayName: "Microeconomics", code: null },
      { id: "subject-macro", displayName: "Macroeconomics", code: null },
    ]),
    correctionHistory: [],
    expectedOutcome: { subjectId: "subject-micro", structureUnitId: null },
  },
  {
    caseId: "classification-eval-filename-only-metadata-signal",
    originalFilename: "linear-algebra-cheat-sheet.pdf",
    contentSignals: [],
    academicStructureTree: singleSubjectTree("subject-linalg", "Linear Algebra", null),
    correctionHistory: [],
    expectedOutcome: { subjectId: "subject-linalg", structureUnitId: null },
  },
  {
    caseId: "classification-eval-noisy-headings-still-resolve",
    originalFilename: "scan-0091.pdf",
    contentSignals: [
      { kind: "heading", text: "Page 1" },
      { kind: "content", text: "Illegible margin note" },
      { kind: "heading", text: "Cell Biology - Mitochondria and Energy Production" },
      { kind: "heading", text: "Continued" },
    ],
    academicStructureTree: singleSubjectTree("subject-cellbio", "Cell Biology", "BIO205"),
    correctionHistory: [],
    expectedOutcome: { subjectId: "subject-cellbio", structureUnitId: null },
  },
  {
    caseId: "classification-eval-unrelated-content-is-insufficient-evidence",
    originalFilename: "scan-0042.pdf",
    contentSignals: [
      { kind: "heading", text: "Untitled Document" },
    ],
    academicStructureTree: singleSubjectTree("subject-thermo-2", "Thermodynamics", "PHY210"),
    correctionHistory: [],
    expectedOutcome: null,
  },
  {
    caseId: "classification-eval-blank-resource-is-insufficient-evidence",
    originalFilename: "image.jpg",
    contentSignals: [],
    academicStructureTree: multiSubjectTree([
      { id: "subject-a", displayName: "History", code: null },
      { id: "subject-b", displayName: "Geography", code: null },
    ]),
    correctionHistory: [],
    expectedOutcome: null,
  },
  {
    caseId: "classification-eval-correction-prior-resolves-tied-evidence",
    originalFilename: "notes.pdf",
    contentSignals: [
      { kind: "heading", text: "Foundations Systems Overview" },
    ],
    academicStructureTree: multiSubjectTree([
      { id: "subject-foundations-eval", displayName: "Foundations", code: "CS100" },
      { id: "subject-systems-eval", displayName: "Systems", code: "CS200" },
    ]),
    correctionHistory: [
      {
        correctedTarget: {
          termId: "term-eval" as never,
          subjectId: "subject-systems-eval" as never,
          structureUnitId: null,
        },
      },
    ],
    expectedOutcome: { subjectId: "subject-systems-eval", structureUnitId: null },
  },
  {
    caseId: "classification-eval-heading-and-filename-agree",
    originalFilename: "algorithms-midterm-review.pdf",
    contentSignals: [
      { kind: "heading", text: "Algorithms Midterm Review Session" },
    ],
    academicStructureTree: singleSubjectTree("subject-algo", "Algorithms", "CS301"),
    correctionHistory: [],
    expectedOutcome: { subjectId: "subject-algo", structureUnitId: null },
  },
  {
    caseId: "classification-eval-single-weak-token-still-files-low-confidence",
    originalFilename: "misc.pdf",
    contentSignals: [
      { kind: "content", text: "A brief mention of statistics in passing" },
    ],
    academicStructureTree: singleSubjectTree("subject-stats", "Statistics", null),
    correctionHistory: [],
    expectedOutcome: { subjectId: "subject-stats", structureUnitId: null },
  },
] as const;
