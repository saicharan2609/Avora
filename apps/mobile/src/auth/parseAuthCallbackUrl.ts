/**
 * The web callback route (apps/web/app/api/auth/callback/route.ts) exchanges
 * the OAuth code server-side and, for a mobile-originated request, redirects
 * to avora://auth-callback with a short-lived, single-use handoff id -
 * never the session itself, so no bearer token is ever placed in a URL.
 * The app exchanges that id for the real session over an HTTPS POST body
 * via AuthPort.exchangeCodeForSession.
 */
export function parseAuthCallbackHandoffId(url: string): string | null {
  const parsed = new URL(url);
  const handoffId = parsed.searchParams.get("handoffId");

  if (handoffId === null || handoffId.length === 0) {
    return null;
  }

  return handoffId;
}
