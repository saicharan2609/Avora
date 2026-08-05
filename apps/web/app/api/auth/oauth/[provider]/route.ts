import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import type { SupabaseStartOAuthInput } from "@avora/adapters/supabase/auth";

import { getRequestOrigin } from "../../_shared/origin";
import { createWebSupabaseAuthAdapter } from "../../_shared/supabase-auth";

type RouteContext = Readonly<{
  params: Promise<
    Readonly<{
      provider: string;
    }>
  >;
}>;

function mapProviderToAuthMethod(provider: string): SupabaseStartOAuthInput["method"] | null {
  if (provider === "google") {
    return "google_oauth";
  }

  if (provider === "apple") {
    return "apple_sign_in";
  }

  return null;
}

export async function GET(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const params = await context.params;
  const method = mapProviderToAuthMethod(params.provider);

  if (method === null) {
    return NextResponse.json(
      {
        error: "unsupported_auth_provider",
      },
      {
        status: 400,
      },
    );
  }

  const auth = createWebSupabaseAuthAdapter();
  const startResult = await auth.startOAuth({
    method,
    redirectTo: `${getRequestOrigin(request)}/api/auth/callback`,
  });

  return NextResponse.redirect(startResult.redirectUrl, {
    status: 302,
  });
}