import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { StyleSheet } from "react-native";

import { getAuthPort, getSecureSessionStore } from "../src/composition";
import { Button, Screen, Text } from "@avora/ui-mobile/primitives";
import { mobileTokens } from "@avora/ui-mobile/tokens";

// A single honest, generic message for every failure branch below. Never
// the underlying error's own message: MobileAuthPortExchangeFailedError's
// copy is already curated, but an unexpected network/provider error is not,
// and ENG-251/SEC-042-class rules require never surfacing raw provider or
// server detail to the student.
const SIGN_IN_FAILED_MESSAGE = "We couldn't sign you in. Please try again.";

export default function AuthCallbackRoute(): ReactElement {
  const router = useRouter();
  const { handoffId, error } = useLocalSearchParams<{ handoffId?: string; error?: string }>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    if (error !== undefined && error.length > 0) {
      setErrorMessage(SIGN_IN_FAILED_MESSAGE);
      return;
    }

    if (handoffId === undefined || handoffId.length === 0) {
      setErrorMessage(SIGN_IN_FAILED_MESSAGE);
      return;
    }

    async function completeSignIn(code: string): Promise<void> {
      try {
        const session = await getAuthPort().exchangeCodeForSession({ code });
        await getSecureSessionStore().writeSession(session);

        if (!isCancelled) {
          router.replace("/(onboarding)/welcome");
        }
      } catch {
        if (!isCancelled) {
          setErrorMessage(SIGN_IN_FAILED_MESSAGE);
        }
      }
    }

    void completeSignIn(handoffId);

    return () => {
      isCancelled = true;
    };
  }, [handoffId, error, router]);

  return (
    <Screen contentContainerStyle={styles.centered}>
      <Text variant="body" color="secondary" style={styles.message}>
        {errorMessage ?? "Signing you in..."}
      </Text>

      {errorMessage !== null ? (
        <Button
          title="Try again"
          intent="primary"
          size="lg"
          onPress={() => router.replace("/(auth)")}
          style={styles.retryButton}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
  },
  retryButton: {
    marginTop: parseInt(mobileTokens.space.lg, 10),
  },
});
