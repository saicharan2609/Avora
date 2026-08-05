import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

import type { SupabaseAuthSession } from "@avora/adapters/supabase/auth";

export const avoraWebAccessTokenCookieName = "__Host-avora_access_token";
export const avoraWebRefreshTokenCookieName = "__Host-avora_refresh_token";

export function createAccessTokenCookie(session: SupabaseAuthSession): ResponseCookie {
  return {
    name: avoraWebAccessTokenCookieName,
    value: session.accessToken,
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    expires: new Date(session.expiresAt),
  };
}

export function createRefreshTokenCookie(session: SupabaseAuthSession): ResponseCookie {
  return {
    name: avoraWebRefreshTokenCookieName,
    value: session.refreshToken,
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
  };
}

export function createExpiredAccessTokenCookie(): ResponseCookie {
  return {
    name: avoraWebAccessTokenCookieName,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    expires: new Date(0),
  };
}

export function createExpiredRefreshTokenCookie(): ResponseCookie {
  return {
    name: avoraWebRefreshTokenCookieName,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    expires: new Date(0),
  };
}