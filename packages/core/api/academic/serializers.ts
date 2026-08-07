import type {
  AcademicApiSetupProgress,
  AcademicApiStructureTree,
  AcademicApiStructureUnit,
  AcademicApiStructureUnitNode,
  AcademicApiSubject,
  AcademicApiSubjectStructureTree,
  AcademicApiTerm,
  AcademicApiTermStructureTree,
  CreateAcademicTermResponse,
  CreateStructureUnitResponse,
  CreateSubjectResponse,
  GetAcademicSetupProgressResponse,
  GetAcademicStructureTreeResponse,
} from "./contracts.js";

export type SerializableAcademicTerm = Readonly<{
  termId: string;
  label: string;
  institutionName: string | null;
  startsOn: string | null;
  endsOn: string | null;
  lifecycleState: AcademicApiTerm["lifecycleState"];
  createdAt: string;
  updatedAt: string;
}>;

export type SerializableAcademicSubject = Readonly<{
  subjectId: string;
  termId: string;
  displayName: string;
  subjectCode: string | null;
  description: string | null;
  lifecycleState: AcademicApiSubject["lifecycleState"];
  createdAt: string;
  updatedAt: string;
}>;

export type SerializableAcademicStructureUnit = Readonly<{
  structureUnitId: string;
  termId: string;
  subjectId: string;
  parentUnitId: string | null;
  title: string;
  description: string | null;
  unitKind: AcademicApiStructureUnit["unitKind"];
  source: AcademicApiStructureUnit["source"];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}>;

export function serializeAcademicTerm(
  term: SerializableAcademicTerm,
): AcademicApiTerm {
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

export function serializeAcademicSubject(
  subject: SerializableAcademicSubject,
): AcademicApiSubject {
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

export function serializeAcademicStructureUnit(
  unit: SerializableAcademicStructureUnit,
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

export function serializeAcademicSetupProgress(
  progress: AcademicApiSetupProgress,
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

export function serializeAcademicStructureUnitNode(
  node: Readonly<{
    unit: SerializableAcademicStructureUnit;
    children: readonly Parameters<typeof serializeAcademicStructureUnitNode>[0][];
  }>,
): AcademicApiStructureUnitNode {
  return {
    unit: serializeAcademicStructureUnit(node.unit),
    children: node.children.map(serializeAcademicStructureUnitNode),
  };
}

export function serializeAcademicSubjectStructureTree(
  subjectTree: Readonly<{
    subject: SerializableAcademicSubject;
    units: readonly Parameters<typeof serializeAcademicStructureUnitNode>[0][];
  }>,
): AcademicApiSubjectStructureTree {
  return {
    subject: serializeAcademicSubject(subjectTree.subject),
    units: subjectTree.units.map(serializeAcademicStructureUnitNode),
  };
}

export function serializeAcademicTermStructureTree(
  termTree: Readonly<{
    term: SerializableAcademicTerm;
    subjects: readonly Parameters<typeof serializeAcademicSubjectStructureTree>[0][];
  }>,
): AcademicApiTermStructureTree {
  return {
    term: serializeAcademicTerm(termTree.term),
    subjects: termTree.subjects.map(serializeAcademicSubjectStructureTree),
  };
}

export function serializeAcademicStructureTree(
  tree: Readonly<{
    terms: readonly Parameters<typeof serializeAcademicTermStructureTree>[0][];
  }>,
): AcademicApiStructureTree {
  return {
    terms: tree.terms.map(serializeAcademicTermStructureTree),
  };
}

export function serializeCreateAcademicTermResponse(
  response: CreateAcademicTermResponse,
): CreateAcademicTermResponse {
  return {
    term: serializeAcademicTerm(response.term),
    progress: serializeAcademicSetupProgress(response.progress),
  };
}

export function serializeCreateSubjectResponse(
  response: CreateSubjectResponse,
): CreateSubjectResponse {
  return {
    subject: serializeAcademicSubject(response.subject),
    progress: serializeAcademicSetupProgress(response.progress),
  };
}

export function serializeCreateStructureUnitResponse(
  response: CreateStructureUnitResponse,
): CreateStructureUnitResponse {
  return {
    structureUnit: serializeAcademicStructureUnit(response.structureUnit),
    progress: serializeAcademicSetupProgress(response.progress),
  };
}

export function serializeGetAcademicSetupProgressResponse(
  response: GetAcademicSetupProgressResponse,
): GetAcademicSetupProgressResponse {
  return {
    progress: serializeAcademicSetupProgress(response.progress),
  };
}

export function serializeGetAcademicStructureTreeResponse(
  response: GetAcademicStructureTreeResponse,
): GetAcademicStructureTreeResponse {
  return {
    tree: serializeAcademicStructureTree(response.tree),
  };
}