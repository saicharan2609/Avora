export const academicApiTermLifecycleStates = [
  "planned",
  "active",
  "completed",
  "archived",
] as const;

export type AcademicApiTermLifecycleState =
  (typeof academicApiTermLifecycleStates)[number];

export const academicApiSubjectLifecycleStates = [
  "active",
  "archived",
] as const;

export type AcademicApiSubjectLifecycleState =
  (typeof academicApiSubjectLifecycleStates)[number];

export const academicApiStructureUnitKinds = [
  "module",
  "topic",
  "week",
  "lecture",
  "assignment_group",
  "exam_area",
  "custom",
] as const;

export type AcademicApiStructureUnitKind =
  (typeof academicApiStructureUnitKinds)[number];

export const academicApiStructureUnitSources = [
  "student_declared",
  "imported",
  "system_suggested",
] as const;

export type AcademicApiStructureUnitSource =
  (typeof academicApiStructureUnitSources)[number];

export const academicApiSetupProgressStatuses = [
  "not_started",
  "in_progress",
  "complete",
] as const;

export type AcademicApiSetupProgressStatus =
  (typeof academicApiSetupProgressStatuses)[number];

export type AcademicApiTerm = Readonly<{
  termId: string;
  label: string;
  institutionName: string | null;
  startsOn: string | null;
  endsOn: string | null;
  lifecycleState: AcademicApiTermLifecycleState;
  createdAt: string;
  updatedAt: string;
}>;

export type AcademicApiSubject = Readonly<{
  subjectId: string;
  termId: string;
  displayName: string;
  subjectCode: string | null;
  description: string | null;
  lifecycleState: AcademicApiSubjectLifecycleState;
  createdAt: string;
  updatedAt: string;
}>;

export type AcademicApiStructureUnit = Readonly<{
  structureUnitId: string;
  termId: string;
  subjectId: string;
  parentUnitId: string | null;
  title: string;
  description: string | null;
  unitKind: AcademicApiStructureUnitKind;
  source: AcademicApiStructureUnitSource;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}>;

export type AcademicApiStructureUnitNode = Readonly<{
  unit: AcademicApiStructureUnit;
  children: readonly AcademicApiStructureUnitNode[];
}>;

export type AcademicApiSubjectStructureTree = Readonly<{
  subject: AcademicApiSubject;
  units: readonly AcademicApiStructureUnitNode[];
}>;

export type AcademicApiTermStructureTree = Readonly<{
  term: AcademicApiTerm;
  subjects: readonly AcademicApiSubjectStructureTree[];
}>;

export type AcademicApiStructureTree = Readonly<{
  terms: readonly AcademicApiTermStructureTree[];
}>;

export type AcademicApiSetupProgress = Readonly<{
  status: AcademicApiSetupProgressStatus;
  termCount: number;
  activeTermCount: number;
  subjectCount: number;
  structureUnitCount: number;
  hasActiveTerm: boolean;
  hasSubject: boolean;
  hasStructure: boolean;
}>;

export type CreateAcademicTermRequest = Readonly<{
  label: string;
  institutionName: string | null;
  startsOn: string | null;
  endsOn: string | null;
}>;

export type CreateAcademicTermResponse = Readonly<{
  term: AcademicApiTerm;
  progress: AcademicApiSetupProgress;
}>;

export type CreateSubjectRequest = Readonly<{
  termId: string;
  displayName: string;
  subjectCode: string | null;
  description: string | null;
}>;

export type CreateSubjectResponse = Readonly<{
  subject: AcademicApiSubject;
  progress: AcademicApiSetupProgress;
}>;

export type CreateStructureUnitRequest = Readonly<{
  termId: string;
  subjectId: string;
  parentUnitId: string | null;
  title: string;
  description: string | null;
  unitKind: AcademicApiStructureUnitKind;
  source: AcademicApiStructureUnitSource;
  sortOrder: number;
}>;

export type CreateStructureUnitResponse = Readonly<{
  structureUnit: AcademicApiStructureUnit;
  progress: AcademicApiSetupProgress;
}>;

export type GetAcademicSetupProgressResponse = Readonly<{
  progress: AcademicApiSetupProgress;
}>;

export type GetAcademicStructureTreeResponse = Readonly<{
  tree: AcademicApiStructureTree;
}>;