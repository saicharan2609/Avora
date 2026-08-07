import type { StudentId } from "@avora/core/identity";
import type {
  AcademicApiSetupProgress,
  AcademicApiStructureTree,
  AcademicApiStructureUnit,
  AcademicApiStructureUnitNode,
  AcademicApiSubject,
  AcademicApiSubjectStructureTree,
  AcademicApiTerm,
  AcademicApiTermStructureTree,
  CreateAcademicTermRequest,
  CreateStructureUnitRequest,
  CreateSubjectRequest,
} from "@avora/core/api/academic";
import type {
  AcademicDateString,
  AcademicSetupProgress,
  AcademicStructureTree,
  AcademicTermId,
  AcademicTermRecord,
  AcademicTermStructureTree,
  CreateAcademicTermInput,
  CreateStructureUnitInput,
  CreateSubjectInput,
  StructureUnitId,
  StructureUnitNode,
  StructureUnitRecord,
  SubjectId,
  SubjectRecord,
  SubjectStructureTree,
} from "@avora/domain/academic";
import type {
  DbAcademicDateString,
  DbAcademicStructureTree,
  DbAcademicTermId,
  DbAcademicTermRecord,
  DbAcademicTermStructureTree,
  DbStructureUnitId,
  DbStructureUnitNode,
  DbStructureUnitRecord,
  DbSubjectId,
  DbSubjectRecord,
  DbSubjectStructureTree,
} from "@avora/db/repositories/academic";

export function mapCreateAcademicTermRequestToDomainInput(
  studentId: StudentId,
  request: CreateAcademicTermRequest,
): CreateAcademicTermInput {
  return {
    studentId,
    label: request.label,
    institutionName: request.institutionName,
    startsOn: request.startsOn as AcademicDateString | null,
    endsOn: request.endsOn as AcademicDateString | null,
  };
}

export function mapCreateSubjectRequestToDomainInput(
  studentId: StudentId,
  request: CreateSubjectRequest,
): CreateSubjectInput {
  return {
    studentId,
    termId: request.termId as AcademicTermId,
    displayName: request.displayName,
    subjectCode: request.subjectCode,
    description: request.description,
  };
}

export function mapCreateStructureUnitRequestToDomainInput(
  studentId: StudentId,
  request: CreateStructureUnitRequest,
): CreateStructureUnitInput {
  return {
    studentId,
    termId: request.termId as AcademicTermId,
    subjectId: request.subjectId as SubjectId,
    parentUnitId: request.parentUnitId as StructureUnitId | null,
    title: request.title,
    description: request.description,
    unitKind: request.unitKind,
    source: request.source,
    sortOrder: request.sortOrder,
  };
}

export function mapDbAcademicTermToDomain(
  term: DbAcademicTermRecord,
): AcademicTermRecord {
  return {
    termId: term.termId as unknown as AcademicTermId,
    studentId: term.studentId,
    label: term.label,
    institutionName: term.institutionName,
    startsOn: term.startsOn as unknown as AcademicDateString | null,
    endsOn: term.endsOn as unknown as AcademicDateString | null,
    lifecycleState: term.lifecycleState,
    createdAt: term.createdAt,
    updatedAt: term.updatedAt,
  };
}

export function mapDbSubjectToDomain(
  subject: DbSubjectRecord,
): SubjectRecord {
  return {
    subjectId: subject.subjectId as unknown as SubjectId,
    studentId: subject.studentId,
    termId: subject.termId as unknown as AcademicTermId,
    displayName: subject.displayName,
    subjectCode: subject.subjectCode,
    description: subject.description,
    lifecycleState: subject.lifecycleState,
    createdAt: subject.createdAt,
    updatedAt: subject.updatedAt,
  };
}

export function mapDbStructureUnitToDomain(
  unit: DbStructureUnitRecord,
): StructureUnitRecord {
  return {
    structureUnitId: unit.structureUnitId as unknown as StructureUnitId,
    studentId: unit.studentId,
    termId: unit.termId as unknown as AcademicTermId,
    subjectId: unit.subjectId as unknown as SubjectId,
    parentUnitId: unit.parentUnitId as unknown as StructureUnitId | null,
    title: unit.title,
    description: unit.description,
    unitKind: unit.unitKind,
    source: unit.source,
    sortOrder: unit.sortOrder,
    createdAt: unit.createdAt,
    updatedAt: unit.updatedAt,
  };
}

export function mapDbAcademicStructureTreeToDomain(
  tree: DbAcademicStructureTree,
): AcademicStructureTree {
  return {
    terms: tree.terms.map(mapDbAcademicTermTreeToDomain),
  };
}

export function mapAcademicTermToApi(term: AcademicTermRecord): AcademicApiTerm {
  return {
    termId: term.termId,
    label: term.label,
    institutionName: term.institutionName,
    startsOn: term.startsOn,
    endsOn: term.endsOn,
    lifecycleState: term.lifecycleState,
    createdAt: term.createdAt,
    updatedAt: term.updatedAt,
  };
}

export function mapSubjectToApi(subject: SubjectRecord): AcademicApiSubject {
  return {
    subjectId: subject.subjectId,
    termId: subject.termId,
    displayName: subject.displayName,
    subjectCode: subject.subjectCode,
    description: subject.description,
    lifecycleState: subject.lifecycleState,
    createdAt: subject.createdAt,
    updatedAt: subject.updatedAt,
  };
}

export function mapStructureUnitToApi(
  unit: StructureUnitRecord,
): AcademicApiStructureUnit {
  return {
    structureUnitId: unit.structureUnitId,
    termId: unit.termId,
    subjectId: unit.subjectId,
    parentUnitId: unit.parentUnitId,
    title: unit.title,
    description: unit.description,
    unitKind: unit.unitKind,
    source: unit.source,
    sortOrder: unit.sortOrder,
    createdAt: unit.createdAt,
    updatedAt: unit.updatedAt,
  };
}

export function mapAcademicSetupProgressToApi(
  progress: AcademicSetupProgress,
): AcademicApiSetupProgress {
  return {
    status: progress.status,
    termCount: progress.termCount,
    activeTermCount: progress.activeTermCount,
    subjectCount: progress.subjectCount,
    structureUnitCount: progress.structureUnitCount,
    hasActiveTerm: progress.hasActiveTerm,
    hasSubject: progress.hasSubject,
    hasStructure: progress.hasStructure,
  };
}

export function mapAcademicStructureTreeToApi(
  tree: AcademicStructureTree,
): AcademicApiStructureTree {
  return {
    terms: tree.terms.map(mapAcademicTermTreeToApi),
  };
}

export function mapDomainAcademicTermIdToDb(
  termId: AcademicTermId,
): DbAcademicTermId {
  return termId as unknown as DbAcademicTermId;
}

export function mapDomainSubjectIdToDb(subjectId: SubjectId): DbSubjectId {
  return subjectId as unknown as DbSubjectId;
}

export function mapDomainStructureUnitIdToDb(
  structureUnitId: StructureUnitId | null,
): DbStructureUnitId | null {
  return structureUnitId as unknown as DbStructureUnitId | null;
}

export function mapDomainAcademicDateToDb(
  date: AcademicDateString | null,
): DbAcademicDateString | null {
  return date as unknown as DbAcademicDateString | null;
}

function mapDbAcademicTermTreeToDomain(
  termTree: DbAcademicTermStructureTree,
): AcademicTermStructureTree {
  return {
    term: mapDbAcademicTermToDomain(termTree.term),
    subjects: termTree.subjects.map(mapDbSubjectTreeToDomain),
  };
}

function mapDbSubjectTreeToDomain(
  subjectTree: DbSubjectStructureTree,
): SubjectStructureTree {
  return {
    subject: mapDbSubjectToDomain(subjectTree.subject),
    units: subjectTree.units.map(mapDbStructureUnitNodeToDomain),
  };
}

function mapDbStructureUnitNodeToDomain(
  node: DbStructureUnitNode,
): StructureUnitNode {
  return {
    unit: mapDbStructureUnitToDomain(node.unit),
    children: node.children.map(mapDbStructureUnitNodeToDomain),
  };
}

function mapAcademicTermTreeToApi(
  termTree: AcademicTermStructureTree,
): AcademicApiTermStructureTree {
  return {
    term: mapAcademicTermToApi(termTree.term),
    subjects: termTree.subjects.map(mapSubjectTreeToApi),
  };
}

function mapSubjectTreeToApi(
  subjectTree: SubjectStructureTree,
): AcademicApiSubjectStructureTree {
  return {
    subject: mapSubjectToApi(subjectTree.subject),
    units: subjectTree.units.map(mapStructureUnitNodeToApi),
  };
}

function mapStructureUnitNodeToApi(
  node: StructureUnitNode,
): AcademicApiStructureUnitNode {
  return {
    unit: mapStructureUnitToApi(node.unit),
    children: node.children.map(mapStructureUnitNodeToApi),
  };
}