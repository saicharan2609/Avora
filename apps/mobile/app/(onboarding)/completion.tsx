import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { View, StyleSheet } from "react-native";

import { Check } from "lucide-react-native";

import type { AcademicApiSetupProgress } from "@avora/core/api/academic";

import { getAcademicClient } from "../../src/composition";
import { useAccessToken } from "../../src/auth/useAccessToken";
import { Button, Text, Skeleton, Screen } from "@avora/ui-mobile/primitives";
import { mobileTokens } from "@avora/ui-mobile/tokens";

const SEAL_SIZE_DP = 64;
const CHECK_ICON_SIZE_DP = 28;

export default function OnboardingCompletionRoute(): ReactElement {
  const router = useRouter();
  const { accessToken, isLoading: isLoadingToken } = useAccessToken();
  const [progress, setProgress] = useState<AcademicApiSetupProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (accessToken === null) {
      return;
    }

    let isCancelled = false;

    // Deferred into a microtask so a synchronous throw from getAcademicClient
    // (e.g. env validation) becomes a rejection the .catch() below already
    // handles, instead of an uncaught exception inside this effect.
    Promise.resolve()
      .then(() => getAcademicClient(accessToken).getSetupProgress())
      .then((response) => {
        if (!isCancelled) {
          setProgress(response.progress);
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Could not load your setup.");
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [accessToken]);

  if (isLoadingToken || (progress === null && errorMessage === null)) {
    return (
      <Screen>
        <View style={styles.header}>
          <Skeleton width={220} height={parseInt(mobileTokens.type.display.lineHeight, 10)} />
          <View style={styles.skeletonSubtitle}>
            <Skeleton width="80%" height={parseInt(mobileTokens.type.body.lineHeight, 10)} />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen glow contentContainerStyle={styles.content}>
      <View style={styles.spacerAbove} />

      <View style={styles.hero}>
        <View style={styles.seal}>
          <Check size={CHECK_ICON_SIZE_DP} color={mobileTokens.accent.strong} strokeWidth={3} />
        </View>
        <Text variant="eyebrow" color="accent" style={styles.eyebrow}>Setup complete</Text>
        <Text variant="display" color="primary" style={styles.headline}>You're all set.</Text>

        {progress !== null ? (
          <View style={styles.statRow}>
            <View style={styles.statBlock}>
              <Text variant="figureSm" color="primary">{progress.subjectCount}</Text>
              <Text variant="caption" color="tertiary">
                subject{progress.subjectCount === 1 ? "" : "s"}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBlock}>
              <Text variant="figureSm" color="primary">{progress.structureUnitCount}</Text>
              <Text variant="caption" color="tertiary">
                unit{progress.structureUnitCount === 1 ? "" : "s"}
              </Text>
            </View>
          </View>
        ) : null}

        {errorMessage !== null ? (
          <Text variant="caption" color="secondary" style={styles.errorText}>{errorMessage}</Text>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Button
          title="Go to Avora"
          intent="primary"
          size="lg"
          onPress={() => router.replace("/home")}
        />
      </View>

      <View style={styles.spacerBelow} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
  },
  skeletonSubtitle: {
    marginTop: parseInt(mobileTokens.space.md, 10),
  },
  content: {
    flexGrow: 1,
  },
  spacerAbove: {
    flex: 1.15,
  },
  spacerBelow: {
    flex: 0.85,
  },
  hero: {
    alignItems: "center",
  },
  seal: {
    width: SEAL_SIZE_DP,
    height: SEAL_SIZE_DP,
    borderRadius: parseInt(mobileTokens.radius.xl, 10),
    backgroundColor: mobileTokens.accent.subtle,
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: mobileTokens.accent.default,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    marginTop: parseInt(mobileTokens.space.lg, 10),
  },
  headline: {
    marginTop: parseInt(mobileTokens.space.sm, 10),
    textAlign: "center",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: parseInt(mobileTokens.space.lg, 10),
    gap: parseInt(mobileTokens.space.lg, 10),
  },
  statBlock: {
    alignItems: "center",
    gap: parseInt(mobileTokens.space.xs, 10),
  },
  statDivider: {
    width: parseInt(mobileTokens.layout.divider, 10),
    height: parseInt(mobileTokens.type.figureSm.lineHeight, 10),
    backgroundColor: mobileTokens.border.subtle,
  },
  errorText: {
    color: mobileTokens.feedback.danger.fg,
    textAlign: "center",
    marginTop: parseInt(mobileTokens.space.lg, 10),
  },
  footer: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
  },
});
