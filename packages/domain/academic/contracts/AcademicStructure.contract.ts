import type {
  AcademicTermId,
  StructureUnitId,
  SubjectId,
} from "./AcademicIdentifiers.contract.js";
import type {
  AcademicStructureUnitKind,
  StructureUnitRecord,
} from "./StructureUnit.contract.js";
import type { SubjectRecord } from "./Subject.contract.js";
import type { AcademicTermRecord } from "./AcademicTerm.contract.js";

export type AcademicStructurePathSegment = Readonly<{
  structureUnitId: StructureUnitId;
  title: string;
  unitKind: AcademicStructureUnitKind;
  depth: number;
}>;

export type AcademicStructurePath = readonly AcademicStructurePathSegment[];

export type StructureUnitNode = Readonly<{
  unit: StructureUnitRecord;
  children: readonly StructureUnitNode[];
}>;

export type SubjectStructureTree = Readonly<{
  subject: SubjectRecord;
  units: readonly StructureUnitNode[];
}>;

export type AcademicTermStructureTree = Readonly<{
  term: AcademicTermRecord;
  subjects: readonly SubjectStructureTree[];
}>;

export type AcademicStructureTree = Readonly<{
  terms: readonly AcademicTermStructureTree[];
}>;

export type LocateStructureUnitInput = Readonly<{
  termId: AcademicTermId;
  subjectId: SubjectId;
  structureUnitId: StructureUnitId;
}>;