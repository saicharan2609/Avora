import type {
  AcademicSetupProgress,
  CreateAcademicTermInput,
  CreateStructureUnitInput,
  CreateSubjectInput,
  GetAcademicSetupProgressInput,
  StructureUnitNode,
} from "../contracts/index.js";
import type { AcademicSetupRepositoryPort } from "../repositories/index.js";

export type AcademicSetupInitializationResult = Readonly<{
  term: Awaited<ReturnType<AcademicSetupRepositoryPort["createAcademicTerm"]>>;
  progress: AcademicSetupProgress;
}>;

export type AcademicSetupSubjectResult = Readonly<{
  subject: Awaited<ReturnType<AcademicSetupRepositoryPort["createSubject"]>>;
  progress: AcademicSetupProgress;
}>;

export type AcademicSetupStructureUnitResult = Readonly<{
  structureUnit: Awaited<ReturnType<AcademicSetupRepositoryPort["createStructureUnit"]>>;
  progress: AcademicSetupProgress;
}>;

export type AcademicSetupService = Readonly<{
  initializeAcademicSetup: (
    input: CreateAcademicTermInput,
  ) => Promise<AcademicSetupInitializationResult>;
  addAcademicSetupSubject: (
    input: CreateSubjectInput,
  ) => Promise<AcademicSetupSubjectResult>;
  addAcademicSetupStructureUnit: (
    input: CreateStructureUnitInput,
  ) => Promise<AcademicSetupStructureUnitResult>;
  getAcademicSetupProgress: (
    input: GetAcademicSetupProgressInput,
  ) => Promise<AcademicSetupProgress>;
}>;

export type AcademicSetupServiceDependencies = Readonly<{
  repository: AcademicSetupRepositoryPort;
}>;

export type AcademicSetupServiceErrorCode =
  | "academic_setup_invalid_term"
  | "academic_setup_invalid_subject"
  | "academic_setup_invalid_structure_unit";

export class AcademicSetupServiceError extends Error {
  public readonly code: AcademicSetupServiceErrorCode;

  public constructor(code: AcademicSetupServiceErrorCode, message: string) {
    super(message);
    this.name = "AcademicSetupServiceError";
    this.code = code;
  }
}

export function createAcademicSetupService(
  dependencies: AcademicSetupServiceDependencies,
): AcademicSetupService {
  return {
    initializeAcademicSetup: async (
      input: CreateAcademicTermInput,
    ): Promise<AcademicSetupInitializationResult> => {
      assertNonEmpty(input.label, "academic_setup_invalid_term", "Academic term label is required.");

      const term = await dependencies.repository.createAcademicTerm(input);
      const progress = await readProgress(dependencies, input.studentId);

      return {
        term,
        progress,
      };
    },

    addAcademicSetupSubject: async (
      input: CreateSubjectInput,
    ): Promise<AcademicSetupSubjectResult> => {
      assertNonEmpty(
        input.displayName,
        "academic_setup_invalid_subject",
        "Subject display name is required.",
      );

      const subject = await dependencies.repository.createSubject(input);
      const progress = await readProgress(dependencies, input.studentId);

      return {
        subject,
        progress,
      };
    },

    addAcademicSetupStructureUnit: async (
      input: CreateStructureUnitInput,
    ): Promise<AcademicSetupStructureUnitResult> => {
      assertNonEmpty(
        input.title,
        "academic_setup_invalid_structure_unit",
        "Structure unit title is required.",
      );

      if (!Number.isSafeInteger(input.sortOrder) || input.sortOrder < 0) {
        throw new AcademicSetupServiceError(
          "academic_setup_invalid_structure_unit",
          "Structure unit sort order must be a non-negative integer.",
        );
      }

      const structureUnit = await dependencies.repository.createStructureUnit(input);
      const progress = await readProgress(dependencies, input.studentId);

      return {
        structureUnit,
        progress,
      };
    },

    getAcademicSetupProgress: async (
      input: GetAcademicSetupProgressInput,
    ): Promise<AcademicSetupProgress> => readProgress(dependencies, input.studentId),
  };
}

async function readProgress(
  dependencies: AcademicSetupServiceDependencies,
  studentId: GetAcademicSetupProgressInput["studentId"],
): Promise<AcademicSetupProgress> {
  const tree = await dependencies.repository.getAcademicStructureTree({
    studentId,
  });

  const termCount = tree.terms.length;
  const activeTermCount = tree.terms.filter(
    (termTree) => termTree.term.lifecycleState === "active" || termTree.term.lifecycleState === "planned",
  ).length;

  const subjectCount = tree.terms.reduce(
    (count, termTree) => count + termTree.subjects.length,
    0,
  );

  const structureUnitCount = tree.terms.reduce(
    (termCountTotal, termTree) =>
      termCountTotal
      + termTree.subjects.reduce(
        (subjectCountTotal, subjectTree) =>
          subjectCountTotal + countStructureUnitNodes(subjectTree.units),
        0,
      ),
    0,
  );

  const hasActiveTerm = activeTermCount > 0;
  const hasSubject = subjectCount > 0;
  const hasStructure = structureUnitCount > 0;

  return {
    studentId,
    status: determineProgressStatus({
      hasActiveTerm,
      hasSubject,
      hasStructure,
    }),
    termCount,
    activeTermCount,
    subjectCount,
    structureUnitCount,
    hasActiveTerm,
    hasSubject,
    hasStructure,
  };
}

function countStructureUnitNodes(nodes: readonly StructureUnitNode[]): number {
  return nodes.reduce(
    (count, node) => count + 1 + countStructureUnitNodes(node.children),
    0,
  );
}

function determineProgressStatus(input: Readonly<{
  hasActiveTerm: boolean;
  hasSubject: boolean;
  hasStructure: boolean;
}>): AcademicSetupProgress["status"] {
  if (!input.hasActiveTerm && !input.hasSubject && !input.hasStructure) {
    return "not_started";
  }

  if (input.hasActiveTerm && input.hasSubject && input.hasStructure) {
    return "complete";
  }

  return "in_progress";
}

function assertNonEmpty(
  value: string,
  code: AcademicSetupServiceErrorCode,
  message: string,
): void {
  if (value.trim().length === 0) {
    throw new AcademicSetupServiceError(code, message);
  }
}