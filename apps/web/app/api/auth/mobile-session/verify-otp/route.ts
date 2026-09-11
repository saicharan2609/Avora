import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SupabaseAuthAdapterError } from "@avora/adapters/supabase/auth";

import { createWebSupabaseAuthAdapter } from "../../_shared/supabase-auth";

type VerifyMobileEmailOtpRequest = Readonly<{
  email: string;
  token: string;
}>;

function isVerifyMobileEmailOtpRequest(value: unknown): value is VerifyMobileEmailOtpRequest {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>)["email"] === "string" &&
    (value as Record<string, unknown>)["email"] !== "" &&
    typeof (value as Record<string, unknown>)["token"] === "string" &&
    (value as Record<string, unknown>)["token"] !== ""
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request_body" }, { status: 400 });
  }

  if (!isVerifyMobileEmailOtpRequest(body)) {
    return NextResponse.json({ error: "missing_email_or_token" }, { status: 400 });
  }

  const auth = createWebSupabaseAuthAdapter();

  try {
    const session = await auth.verifyEmailOtp({ email: body.email, token: body.token });

    return NextResponse.json({
      studentId: session.studentId,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    if (error instanceof SupabaseAuthAdapterError) {
      // Deliberately generic: a distinct response for "wrong code" versus
      // "unknown email" would turn this endpoint into an account-existence
      // oracle (SEC-042).
      return NextResponse.json({ error: "auth_verify_email_otp_failed" }, { status: 401 });
    }

    throw error;
  }
}
