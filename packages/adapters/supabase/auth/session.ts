import type { Session, User } from "@supabase/supabase-js";

import type { StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type { SupabaseAuthIdentity, SupabaseAuthSession } from "./contracts.js";
import { SupabaseAuthAdapterError } from "./errors.js";

export function mapSupabaseSessionToAuthSession(session: Session | null): SupabaseAuthSession {
  if (session === null) {
    throw new SupabaseAuthAdapterError("auth_missing_session", "Supabase Auth returned no session");
  }

  if (session.user.id.length === 0) {
    throw new SupabaseAuthAdapterError("auth_missing_user", "Supabase Auth returned no user id");
  }

  if (session.expires_at === undefined) {
    throw new SupabaseAuthAdapterError(
      "auth_missing_expiry",
      "Supabase Auth returned a session without an expiry",
    );
  }

  return {
    studentId: session.user.id as StudentId,
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: new Date(session.expires_at * 1000).toISOString() as IsoDateTimeString,
  };
}

export function mapSupabaseUserToAuthIdentity(user: User | null): SupabaseAuthIdentity | null {
  if (user === null) {
    return null;
  }

  if (user.id.length === 0) {
    throw new SupabaseAuthAdapterError("auth_missing_user", "Supabase Auth returned no user id");
  }

  return {
    studentId: user.id as StudentId,
  };
}