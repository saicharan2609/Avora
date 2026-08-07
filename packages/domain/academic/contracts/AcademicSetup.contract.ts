import type { StudentId } from "@avora/core/identity";

export const academicSetupProgressStatuses = [
  "not_started",
  "in_progress",
  "complete",
] as const;

export type AcademicSetupProgressStatus =
  (typeof academicSetupProgressStatuses)[number];

export type AcademicSetupProgress = Readonly<{
  studentId: StudentId;
  status: AcademicSetupProgressStatus;
  termCount: number;
  activeTermCount: number;
  subjectCount: number;
  structureUnitCount: number;
  hasActiveTerm: boolean;
  hasSubject: boolean;
  hasStructure: boolean;
}>;

export type GetAcademicSetupProgressInput = Readonly<{
  studentId: StudentId;
}>;