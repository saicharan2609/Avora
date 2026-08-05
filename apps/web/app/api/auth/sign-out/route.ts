import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  createExpiredAccessTokenCookie,
  createExpiredRefreshTokenCookie,
} from "../_shared/session-cookie";
import { createWebSupabaseAuthAdapter } from "../_shared/supabase-auth";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = createWebSupabaseAuthAdapter();

  await auth.signOut();

  const response = NextResponse.redirect(new URL("/", request.nextUrl.origin), {
    status: 303,
  });

  response.cookies.set(createExpiredAccessTokenCookie());
  response.cookies.set(createExpiredRefreshTokenCookie());

  return response;
}