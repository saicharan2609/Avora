import { useEffect, useState } from "react";

import { getSecureSessionStore } from "../composition";

export type AccessTokenState = Readonly<{
  accessToken: string | null;
  isLoading: boolean;
  // True only once the session read has finished and genuinely found no
  // session — a distinct, terminal state from "still loading". Screens that
  // gate a data fetch on `accessToken !== null` must check this separately,
  // or a missing session leaves their own `hasLoadedOnce` flag permanently
  // false and their loading state never resolves.
  isSignedOut: boolean;
}>;

export function useAccessToken(): AccessTokenState {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    getSecureSessionStore()
      .readSession()
      .then((session) => {
        if (!isCancelled) {
          setAccessToken(session === null ? null : session.accessToken);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  return { accessToken, isLoading, isSignedOut: !isLoading && accessToken === null };
}
