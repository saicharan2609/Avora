import type { StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type {
  AcademicTermId,
  StructureUnitId,
  SubjectId,
} from "./AcademicIdentifiers.contract.js";

export const academicStructureUnitKinds = [
  "module",
  "topic",
  "week",
  "lecture",
  "assignment_group",
  "exam_area",
  "custom",
] as const;

export type AcademicStructureUnitKind =
  (typeof academicStructureUnitKinds)[number];

export const structureUnitSources = [
  "student_declared",
  "imported",
  "system_suggested",
] as const;

export type StructureUnitSource = (typeof structureUnitSources)[number];

export type StructureUnitRecord = Readonly<{
  structureUnitId: StructureUnitId;
  studentId: StudentId;
  termId: AcademicTermId;
  subjectId: SubjectId;
  parentUnitId: StructureUnitId | null;
  title: string;
  description: string | null;
  unitKind: AcademicStructureUnitKind;
  source: StructureUnitSource;
  sortOrder: number;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}>;

export type CreateStructureUnitInput = Readonly<{
  studentId: StudentId;
  termId: AcademicTermId;
  subjectId: SubjectId;
  parentUnitId: StructureUnitId | null;
  title: string;
  description: string | null;
  unitKind: AcademicStructureUnitKind;
  source: StructureUnitSource;
  sortOrder: number;
}>;

export type MoveStructureUnitInput = Readonly<{
  studentId: StudentId;
  structureUnitId: StructureUnitId;
  parentUnitId: StructureUnitId | null;
  sortOrder: number;
}>;

export type RenameStructureUnitInput = Readonly<{
  studentId: StudentId;
  structureUnitId: StructureUnitId;
  title: string;
}>;