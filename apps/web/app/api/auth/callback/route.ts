import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

export async function GET(request: NextRequest): Promise<NextResponse> {
  const code = readAuthCode(request);

  if (code === null) {
    return NextResponse.json(
      {
        error: "missing_auth_code",
      },
      {
        status: 400,
      },
    );
  }

  const auth = createWebSupabaseAuthAdapter();
  const session = await auth.exchangeCodeForSession({
    code,
  });

  const response = NextResponse.redirect(new URL("/app", request.nextUrl.origin), {
    status: 302,
  });

  response.cookies.set(createAccessTokenCookie(session));
  response.cookies.set(createRefreshTokenCookie(session));

  return response;
}