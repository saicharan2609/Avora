import type { StudentId } from "@avora/core/identity";

export type AuthIdentity = Readonly<{
  studentId: StudentId;
}>;