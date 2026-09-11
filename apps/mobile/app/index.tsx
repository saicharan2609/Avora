import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { getAcademicClient, getSecureSessionStore } from "../src/composition";
import { AvoraMark, Button, Screen, Text } from "@avora/ui-mobile/primitives";
import { mobileTokens } from "@avora/ui-mobile/tokens";

const MARK_SIZE_DP = 88;

// Group 8 is scoped to the *first-session* onboarding experience
// (docs/MASTER-ROADMAP.md Group 8 objective) — a returning student with an
// active term and at least one subject already declared has finished it and
// must land on their workspace, not walk the wizard again. Re-entering
// onboarding on every launch would also silently create a duplicate
// academic term each time `term.tsx` calls `createAcademicTerm`. Structure
// is deliberately excluded from this check: FR-015 makes "no structure" a
// complete, first-class state, so requiring it here would trap those
// students back in onboarding forever.
async function resolveSignedInDestination(accessToken: string): Promise<Href> {
  try {
    const { progress } = await getAcademicClient(accessToken).getSetupProgress();

    return progress.hasActiveTerm && progress.hasSubject ? "/home" : "/(onboarding)/welcome";
  } catch {
    return "/(onboarding)/welcome";
  }
}

export default function IndexRoute(): ReactElement {
  const router = useRouter();
  const [devDestination, setDevDestination] = useState<Href | null>(null);

  useEffect(() => {
    let isCancelled = false;

    getSecureSessionStore()
      .readSession()
      .then(async (session) => {
        if (isCancelled) {
          return;
        }

        const destination: Href =
          session === null ? "/(auth)" : await resolveSignedInDestination(session.accessToken);

        if (isCancelled) {
          return;
        }

        // In development, pause here instead of auto-redirecting so the
        // dev-only screen-preview link below is actually reachable — in
        // production this branch never exists (__DEV__ is compiled out).
        if (__DEV__) {
          setDevDestination(destination);
          return;
        }

        router.replace(destination);
      })
      .catch(() => {
        if (isCancelled) {
          return;
        }

        if (__DEV__) {
          // Same reasoning as the success path above: dev mode must always
          // reach the "Continue"/"Dev: screen preview" buttons rather than
          // stall on the spinner forever, even when the session read itself
          // failed — previously this branch did nothing on failure, so any
          // rejection here left the screen on its loading state permanently.
          setDevDestination("/(auth)");
          return;
        }

        router.replace("/(auth)");
      });

    return () => {
      isCancelled = true;
    };
  }, [router]);

  return (
    <Screen contentContainerStyle={styles.centered} glow glowVariant="hero">
      <View style={styles.brand}>
        <AvoraMark sizeDp={MARK_SIZE_DP} />
        <Text variant="titleMd" color="primary" style={styles.wordmark}>Avora</Text>
      </View>

      {devDestination === null ? (
        <ActivityIndicator color={mobileTokens.accent.default} />
      ) : (
        <View style={styles.devActions}>
          <Button
            title="Continue"
            intent="primary"
            size="lg"
            onPress={() => router.replace(devDestination)}
          />
          <Button
            title="Dev: screen preview"
            intent="tertiary"
            size="sm"
            onPress={() => router.push("/dev-preview")}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    alignItems: "center",
    gap: parseInt(mobileTokens.space.md, 10),
    marginBottom: parseInt(mobileTokens.space.xxl, 10),
  },
  wordmark: {
    letterSpacing: -0.4,
  },
  devActions: {
    alignItems: "center",
    gap: parseInt(mobileTokens.space.md, 10),
  },
});
