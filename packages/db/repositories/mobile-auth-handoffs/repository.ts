import type { StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type { DatabaseClient } from "../../client/index.js";

export type DbMobileAuthHandoffId = string & {
  readonly __brand: "DbMobileAuthHandoffId";
};

export type DbMobileAuthHandoffSession = Readonly<{
  studentId: StudentId;
  accessToken: string;
  refreshToken: string;
  expiresAt: IsoDateTimeString;
}>;

export type CreateMobileAuthHandoffInput = DbMobileAuthHandoffSession;

export type ConsumeMobileAuthHandoffInput = Readonly<{
  handoffId: DbMobileAuthHandoffId;
}>;

export type MobileAuthHandoffsRepositoryErrorCode =
  | "mobile_auth_handoffs_repository_create_failed"
  | "mobile_auth_handoffs_repository_consume_failed";

export class MobileAuthHandoffsRepositoryError extends Error {
  public readonly code: MobileAuthHandoffsRepositoryErrorCode;

  public constructor(code: MobileAuthHandoffsRepositoryErrorCode, message: string) {
    super(message);
    this.name = "MobileAuthHandoffsRepositoryError";
    this.code = code;
  }
}

export type MobileAuthHandoffsRepository = Readonly<{
  createHandoff: (
    input: CreateMobileAuthHandoffInput,
  ) => Promise<DbMobileAuthHandoffId>;
  consumeHandoff: (
    input: ConsumeMobileAuthHandoffInput,
  ) => Promise<DbMobileAuthHandoffSession | null>;
}>;

export type CreateMobileAuthHandoffsRepositoryInput = Readonly<{
  client: DatabaseClient;
}>;

export function createMobileAuthHandoffsRepository(
  input: CreateMobileAuthHandoffsRepositoryInput,
): MobileAuthHandoffsRepository {
  return {
    createHandoff: async (
      handoff: CreateMobileAuthHandoffInput,
    ): Promise<DbMobileAuthHandoffId> => {
      const { data, error } = await input.client
        .from("mobile_auth_handoffs")
        .insert({
          student_id: handoff.studentId,
          access_token: handoff.accessToken,
          refresh_token: handoff.refreshToken,
          expires_at: handoff.expiresAt,
        })
        .select("handoff_id")
        .single();

      if (error !== null) {
        throw new MobileAuthHandoffsRepositoryError(
          "mobile_auth_handoffs_repository_create_failed",
          error.message,
        );
      }

      return data.handoff_id as DbMobileAuthHandoffId;
    },

    consumeHandoff: async (
      lookup: ConsumeMobileAuthHandoffInput,
    ): Promise<DbMobileAuthHandoffSession | null> => {
      const { data, error } = await input.client.rpc("consume_mobile_auth_handoff", {
        handoff_code: lookup.handoffId,
      });

      if (error !== null) {
        throw new MobileAuthHandoffsRepositoryError(
          "mobile_auth_handoffs_repository_consume_failed",
          error.message,
        );
      }

      const row = data[0];

      if (row === undefined) {
        return null;
      }

      return {
        studentId: row.student_id as StudentId,
        accessToken: row.access_token,
        refreshToken: row.refresh_token,
        expiresAt: row.expires_at as IsoDateTimeString,
      };
    },
  };
}
