import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getRequestOrigin } from "../_shared/origin";
import { createWebSupabaseAuthAdapter } from "../_shared/supabase-auth";
function readEmailFromRequest(request: NextRequest): string | null {
  const email = request.nextUrl.searchParams.get("email");

  if (email === null || email.trim().length === 0) {
    return null;
  }

  return email.trim();
}

function readMobileCallbackFlag(request: NextRequest): boolean {
  return request.nextUrl.searchParams.get("platform") === "mobile";
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const email = readEmailFromRequest(request);

  if (email === null) {
    return NextResponse.json(
      {
        error: "missing_email",
      },
      {
        status: 400,
      },
    );
  }

  const callbackUrl = new URL("/api/auth/callback", getRequestOrigin(request));

  if (readMobileCallbackFlag(request)) {
    callbackUrl.searchParams.set("platform", "mobile");
  }

  const auth = createWebSupabaseAuthAdapter();

  await auth.startEmailMagicLink({
    email,
    redirectTo: callbackUrl.toString(),
  });

  return NextResponse.redirect(new URL("/auth/check-email", getRequestOrigin(request)), {
    status: 302,
  });
}