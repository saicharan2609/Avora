import type { StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

export type AuthSession = Readonly<{
  studentId: StudentId;
  accessToken: string;
  refreshToken: string;
  expiresAt: IsoDateTimeString;
}>;