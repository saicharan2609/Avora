import type { NextRequest } from "next/server";

export function getRequestOrigin(request: NextRequest): string {
  return request.nextUrl.origin;
}