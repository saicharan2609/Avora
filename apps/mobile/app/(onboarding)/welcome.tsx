import { useRouter } from "expo-router";
import type { ReactElement } from "react";
import { View, StyleSheet } from "react-native";

import { Button, Text, Screen, AvoraMark } from "@avora/ui-mobile/primitives";
import { mobileTokens } from "@avora/ui-mobile/tokens";

const MARK_SIZE_DP = 64;

export default function OnboardingWelcomeRoute(): ReactElement {
  const router = useRouter();

  return (
    <Screen glow contentContainerStyle={styles.content}>
      <View style={styles.spacerAbove} />

      <View>
        <AvoraMark sizeDp={MARK_SIZE_DP} />
        <Text variant="display" color="primary" style={styles.headline}>
          Let's personalize your semester.
        </Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          We'll set everything up in just a couple of minutes.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Get started"
          intent="primary"
          size="xl"
          onPress={() => router.push("/(onboarding)/institution")}
        />

        <Text variant="caption" color="tertiary" style={styles.disclaimer}>
          You can change any of this later.
        </Text>
      </View>

      <View style={styles.spacerBelow} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  // Rule DP-05 (docs/DESIGN-SYSTEM.md §5): a larger spacer above than below
  // settles the block toward the thumb zone instead of stretching the
  // headline and CTA to opposite screen edges.
  spacerAbove: {
    flex: 1.15,
  },
  spacerBelow: {
    flex: 0.85,
  },
  headline: {
    marginTop: parseInt(mobileTokens.space.lg, 10),
  },
  subtitle: {
    marginTop: parseInt(mobileTokens.space.md, 10),
  },
  actions: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
    gap: parseInt(mobileTokens.space.md, 10),
  },
  disclaimer: {
    textAlign: "center",
  },
});
