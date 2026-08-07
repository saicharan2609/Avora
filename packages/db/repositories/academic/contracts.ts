import type { StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type { Database } from "../../generated/database.types.js";

export type DbAcademicTermId = string & {
  readonly __brand: "DbAcademicTermId";
};

export type DbSubjectId = string & {
  readonly __brand: "DbSubjectId";
};

export type DbStructureUnitId = string & {
  readonly __brand: "DbStructureUnitId";
};

export type DbAcademicDateString = string & {
  readonly __brand: "DbAcademicDateString";
};

export type DbAcademicTermLifecycleState =
  Database["public"]["Enums"]["academic_term_lifecycle_state"];

export type DbSubjectLifecycleState =
  Database["public"]["Enums"]["subject_lifecycle_state"];

export type DbAcademicStructureUnitKind =
  Database["public"]["Enums"]["academic_structure_unit_kind"];

export type DbStructureUnitSource =
  Database["public"]["Enums"]["structure_unit_source"];

export type DbAcademicTermRecord = Readonly<{
  termId: DbAcademicTermId;
  studentId: StudentId;
  label: string;
  institutionName: string | null;
  startsOn: DbAcademicDateString | null;
  endsOn: DbAcademicDateString | null;
  lifecycleState: DbAcademicTermLifecycleState;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}>;

export type DbSubjectRecord = Readonly<{
  subjectId: DbSubjectId;
  studentId: StudentId;
  termId: DbAcademicTermId;
  displayName: string;
  subjectCode: string | null;
  description: string | null;
  lifecycleState: DbSubjectLifecycleState;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}>;

export type DbStructureUnitRecord = Readonly<{
  structureUnitId: DbStructureUnitId;
  studentId: StudentId;
  termId: DbAcademicTermId;
  subjectId: DbSubjectId;
  parentUnitId: DbStructureUnitId | null;
  title: string;
  description: string | null;
  unitKind: DbAcademicStructureUnitKind;
  source: DbStructureUnitSource;
  sortOrder: number;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}>;

export type DbStructureUnitNode = Readonly<{
  unit: DbStructureUnitRecord;
  children: readonly DbStructureUnitNode[];
}>;

export type DbSubjectStructureTree = Readonly<{
  subject: DbSubjectRecord;
  units: readonly DbStructureUnitNode[];
}>;

export type DbAcademicTermStructureTree = Readonly<{
  term: DbAcademicTermRecord;
  subjects: readonly DbSubjectStructureTree[];
}>;

export type DbAcademicStructureTree = Readonly<{
  terms: readonly DbAcademicTermStructureTree[];
}>;

export type CreateAcademicTermInput = Readonly<{
  studentId: StudentId;
  label: string;
  institutionName: string | null;
  startsOn: DbAcademicDateString | null;
  endsOn: DbAcademicDateString | null;
}>;

export type ListAcademicTermsInput = Readonly<{
  studentId: StudentId;
}>;

export type GetAcademicTermByIdInput = Readonly<{
  studentId: StudentId;
  termId: DbAcademicTermId;
}>;

export type CreateSubjectInput = Readonly<{
  studentId: StudentId;
  termId: DbAcademicTermId;
  displayName: string;
  subjectCode: string | null;
  description: string | null;
}>;

export type ListSubjectsByTermInput = Readonly<{
  studentId: StudentId;
  termId: DbAcademicTermId;
}>;

export type GetSubjectByIdInput = Readonly<{
  studentId: StudentId;
  subjectId: DbSubjectId;
}>;

export type CreateStructureUnitInput = Readonly<{
  studentId: StudentId;
  termId: DbAcademicTermId;
  subjectId: DbSubjectId;
  parentUnitId: DbStructureUnitId | null;
  title: string;
  description: string | null;
  unitKind: DbAcademicStructureUnitKind;
  source: DbStructureUnitSource;
  sortOrder: number;
}>;

export type ListStructureUnitsBySubjectInput = Readonly<{
  studentId: StudentId;
  subjectId: DbSubjectId;
}>;

export type GetAcademicStructureTreeInput = Readonly<{
  studentId: StudentId;
}>;

export type AcademicGraphRepository = Readonly<{
  createAcademicTerm: (
    input: CreateAcademicTermInput,
  ) => Promise<DbAcademicTermRecord>;
  listAcademicTerms: (
    input: ListAcademicTermsInput,
  ) => Promise<readonly DbAcademicTermRecord[]>;
  getAcademicTermById: (
    input: GetAcademicTermByIdInput,
  ) => Promise<DbAcademicTermRecord | null>;
  createSubject: (
    input: CreateSubjectInput,
  ) => Promise<DbSubjectRecord>;
  listSubjectsByTerm: (
    input: ListSubjectsByTermInput,
  ) => Promise<readonly DbSubjectRecord[]>;
  getSubjectById: (
    input: GetSubjectByIdInput,
  ) => Promise<DbSubjectRecord | null>;
  createStructureUnit: (
    input: CreateStructureUnitInput,
  ) => Promise<DbStructureUnitRecord>;
  listStructureUnitsBySubject: (
    input: ListStructureUnitsBySubjectInput,
  ) => Promise<readonly DbStructureUnitRecord[]>;
  getAcademicStructureTree: (
    input: GetAcademicStructureTreeInput,
  ) => Promise<DbAcademicStructureTree>;
}>;