import type { StudentId } from "@avora/core/identity";

import type {
  AcademicStructureTree,
  AcademicTermRecord,
  CreateAcademicTermInput,
  CreateStructureUnitInput,
  CreateSubjectInput,
  StructureUnitRecord,
  SubjectRecord,
} from "../contracts/index.js";

export type GetAcademicStructureTreeForSetupInput = Readonly<{
  studentId: StudentId;
}>;

export type AcademicSetupRepositoryPort = Readonly<{
  createAcademicTerm: (
    input: CreateAcademicTermInput,
  ) => Promise<AcademicTermRecord>;
  createSubject: (
    input: CreateSubjectInput,
  ) => Promise<SubjectRecord>;
  createStructureUnit: (
    input: CreateStructureUnitInput,
  ) => Promise<StructureUnitRecord>;
  getAcademicStructureTree: (
    input: GetAcademicStructureTreeForSetupInput,
  ) => Promise<AcademicStructureTree>;
}>;