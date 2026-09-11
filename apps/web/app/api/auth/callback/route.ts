import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SupabaseAuthAdapterError } from "@avora/adapters/supabase/auth";
import { MobileAuthHandoffsRepositoryError } from "@avora/db/repositories/mobile-auth-handoffs";

import { createMobileAuthHandoff } from "../_shared/mobile-auth-handoff";
import {
  createAccessTokenCookie,
  createRefreshTokenCookie,
} from "../_shared/session-cookie";
import { createWebSupabaseAuthAdapter } from "../_shared/supabase-auth";

function readAuthCode(request: NextRequest): string | null {
  const code = request.nextUrl.searchParams.get("code");

  if (code === null || code.length === 0) {
    return null;
  }

  return code;
}

function readMobileCallbackFlag(request: NextRequest): boolean {
  return request.nextUrl.searchParams.get("platform") === "mobile";
}

// A missing/expired/invalid code must still return the student to a place
// they can retry from — for a mobile-originated request that place is the
// app itself, reached only through the same avora:// deep link the success
// path already uses. The link carries an opaque failure code only: never
// the underlying Supabase error, an authorization code, or any token
// (ENG-251, SEC-042-class account-existence-oracle avoidance).
function redirectToAuthFailure(request: NextRequest, isMobileCallback: boolean): NextResponse {
  if (isMobileCallback) {
    const mobileCallbackUrl = new URL("avora://auth-callback");

    mobileCallbackUrl.searchParams.set("error", "auth_failed");

    return NextResponse.redirect(mobileCallbackUrl, {
      status: 302,
    });
  }

  return NextResponse.redirect(new URL("/sign-in-failed", request.nextUrl.origin), {
    status: 302,
  });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const isMobileCallback = readMobileCallbackFlag(request);
  const code = readAuthCode(request);

  if (code === null) {
    return redirectToAuthFailure(request, isMobileCallback);
  }

  const auth = createWebSupabaseAuthAdapter();

  const session = await auth.exchangeCodeForSession({ code }).catch((error: unknown) => {
    if (error instanceof SupabaseAuthAdapterError) {
      return null;
    }

    throw error;
  });

  if (session === null) {
    return redirectToAuthFailure(request, isMobileCallback);
  }

  if (isMobileCallback) {
    // createMobileAuthHandoff is a DB write (mobile_auth_handoffs insert) and
    // can fail for the same class of external reasons the exchange call
    // above already accounts for. Treated identically: an expected
    // operational failure (MobileAuthHandoffsRepositoryError, the same
    // named-error-with-code shape as SupabaseAuthAdapterError) routes to the
    // same safe failure redirect rather than surfacing as an unhandled 500
    // inside the mobile WebBrowser session.
    const handoffId = await createMobileAuthHandoff(session).catch((error: unknown) => {
      if (error instanceof MobileAuthHandoffsRepositoryError) {
        return null;
      }

      throw error;
    });

    if (handoffId === null) {
      return redirectToAuthFailure(request, isMobileCallback);
    }

    const mobileCallbackUrl = new URL("avora://auth-callback");

    mobileCallbackUrl.searchParams.set("handoffId", handoffId);

    return NextResponse.redirect(mobileCallbackUrl, {
      status: 302,
    });
  }

  const response = NextResponse.redirect(new URL("/app", request.nextUrl.origin), {
    status: 302,
  });

  response.cookies.set(createAccessTokenCookie(session));
  response.cookies.set(createRefreshTokenCookie(session));

  return response;
}