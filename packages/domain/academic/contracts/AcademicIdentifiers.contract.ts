import type { StudentId } from "@avora/core/identity";

export type AcademicTermId = string & {
  readonly __brand: "AcademicTermId";
};

export type SubjectId = string & {
  readonly __brand: "SubjectId";
};

export type StructureUnitId = string & {
  readonly __brand: "StructureUnitId";
};

export type AcademicDateString = string & {
  readonly __brand: "AcademicDateString";
};

export type StudentScopedAcademicIdentity = Readonly<{
  studentId: StudentId;
}>;