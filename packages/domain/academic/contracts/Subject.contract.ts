import type { StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type {
  AcademicTermId,
  SubjectId,
} from "./AcademicIdentifiers.contract.js";

export const subjectLifecycleStates = [
  "active",
  "archived",
] as const;

export type SubjectLifecycleState = (typeof subjectLifecycleStates)[number];

export type SubjectRecord = Readonly<{
  subjectId: SubjectId;
  studentId: StudentId;
  termId: AcademicTermId;
  displayName: string;
  subjectCode: string | null;
  description: string | null;
  lifecycleState: SubjectLifecycleState;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}>;

export type CreateSubjectInput = Readonly<{
  studentId: StudentId;
  termId: AcademicTermId;
  displayName: string;
  subjectCode: string | null;
  description: string | null;
}>;

export type RenameSubjectInput = Readonly<{
  studentId: StudentId;
  subjectId: SubjectId;
  displayName: string;
}>;

export type ArchiveSubjectInput = Readonly<{
  studentId: StudentId;
  subjectId: SubjectId;
}>;