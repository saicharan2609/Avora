import type { StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type {
  AcademicDateString,
  AcademicTermId,
} from "./AcademicIdentifiers.contract.js";

export const academicTermLifecycleStates = [
  "planned",
  "active",
  "completed",
  "archived",
] as const;

export type AcademicTermLifecycleState =
  (typeof academicTermLifecycleStates)[number];

export type AcademicTermRecord = Readonly<{
  termId: AcademicTermId;
  studentId: StudentId;
  label: string;
  institutionName: string | null;
  startsOn: AcademicDateString | null;
  endsOn: AcademicDateString | null;
  lifecycleState: AcademicTermLifecycleState;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}>;

export type CreateAcademicTermInput = Readonly<{
  studentId: StudentId;
  label: string;
  institutionName: string | null;
  startsOn: AcademicDateString | null;
  endsOn: AcademicDateString | null;
}>;

export type RenameAcademicTermInput = Readonly<{
  studentId: StudentId;
  termId: AcademicTermId;
  label: string;
}>;

export type ArchiveAcademicTermInput = Readonly<{
  studentId: StudentId;
  termId: AcademicTermId;
}>;