import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { createAnonymousDatabaseClient } from "@avora/db/client";
import { createMobileAuthHandoffsRepository } from "@avora/db/repositories/mobile-auth-handoffs";
import type { DbMobileAuthHandoffId } from "@avora/db/repositories/mobile-auth-handoffs";

import { readWebAuthEnvironment } from "../../_shared/supabase-auth";

type ExchangeMobileSessionRequest = Readonly<{
  handoffId: string;
}>;

function isExchangeMobileSessionRequest(
  value: unknown,
): value is ExchangeMobileSessionRequest {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>)["handoffId"] === "string" &&
    (value as Record<string, unknown>)["handoffId"] !== ""
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request_body" }, { status: 400 });
  }

  if (!isExchangeMobileSessionRequest(body)) {
    return NextResponse.json({ error: "missing_handoff_id" }, { status: 400 });
  }

  const environment = readWebAuthEnvironment();
  const anonymousDatabase = createAnonymousDatabaseClient({
    supabaseUrl: environment.supabaseUrl,
    supabaseAnonKey: environment.supabaseAnonKey,
  });

  const handoffs = createMobileAuthHandoffsRepository({
    client: anonymousDatabase.client,
  });

  const session = await handoffs.consumeHandoff({
    handoffId: body.handoffId as DbMobileAuthHandoffId,
  });

  if (session === null) {
    return NextResponse.json(
      { error: "handoff_expired_or_already_used" },
      { status: 410 },
    );
  }

  return NextResponse.json({
    studentId: session.studentId,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresAt: session.expiresAt,
  });
}
