import { useRouter } from "expo-router";
import { useState } from "react";
import type { ReactElement } from "react";
import { View, StyleSheet } from "react-native";
import * as WebBrowser from "expo-web-browser";

import { AvoraMark, Button, Text, Screen } from "@avora/ui-mobile/primitives";
import { mobileTokens } from "@avora/ui-mobile/tokens";
import { getAuthPort } from "../../src/composition";
import { GoogleGlyph } from "../../src/auth/GoogleGlyph";

export default function SignInRoute(): ReactElement {
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function signInWithOAuth(method: "google_oauth" | "apple_sign_in"): Promise<void> {
    setErrorMessage(null);
    setIsSigningIn(true);

    try {
      const { redirectUrl } = await getAuthPort().startOAuth({
        method,
        redirectTo: "avora://auth-callback",
      });
      const result = await WebBrowser.openAuthSessionAsync(redirectUrl, "avora://auth-callback");

      if (result.type !== "success") {
        setIsSigningIn(false);
      }
    } catch (error) {
      setIsSigningIn(false);
      setErrorMessage(error instanceof Error ? error.message : "Sign-in failed.");
    }
  }

  return (
    <Screen glow glowVariant="hero" contentContainerStyle={styles.content}>
      <View style={styles.spacerAbove} />
      <View style={styles.hero}>
        <View style={styles.wordmarkRow}>
          <AvoraMark sizeDp={40} />
          <Text variant="titleMd" color="primary">Avora</Text>
        </View>
        <Text variant="body" color="secondary" style={styles.tagline}>
          Knowledge accelerated.
        </Text>
      </View>

      <View style={styles.actions}>
        {/* Rule AU-04 (docs/DESIGN-SYSTEM.md §34.2): the email path is primary
            and sits above the divider; federated sign-in is secondary, below it. */}
        <Button
          title="Continue with email"
          intent="primary"
          size="xl"
          state={isSigningIn ? "loading" : "default"}
          onPress={() => router.push("/(auth)/email")}
        />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text variant="eyebrow" color="tertiary">or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.federatedGroup}>
          <Button
            title="Continue with Google"
            intent="neutral"
            size="lg"
            icon={<GoogleGlyph />}
            iconPosition="leading"
            state={isSigningIn ? "loading" : "default"}
            onPress={() => void signInWithOAuth("google_oauth")}
          />
          {/* Apple Sign-In has no reference-prototype counterpart (neither
              prototype offers it), but is a required Stage 12 Group 8
              deliverable per docs/MASTER-ROADMAP.md — kept intentionally. */}
          <Button
            title="Continue with Apple"
            intent="neutral"
            size="lg"
            state={isSigningIn ? "loading" : "default"}
            onPress={() => void signInWithOAuth("apple_sign_in")}
          />
        </View>

        {errorMessage !== null ? (
          <Text variant="caption" style={styles.errorText}>{errorMessage}</Text>
        ) : null}
      </View>
      <View style={styles.spacerBelow} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  // Rule DP-05 (docs/DESIGN-SYSTEM.md §5): primary actions live in the lower
  // third. A larger spacer above than below settles the brand+action block
  // slightly under true vertical center, toward the thumb zone, instead of
  // splitting it dead-center or stretching it to the screen edges.
  spacerAbove: {
    flex: 1.15,
  },
  spacerBelow: {
    flex: 0.85,
  },
  hero: {
    alignItems: "center",
  },
  wordmarkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: parseInt(mobileTokens.space.md, 10),
  },
  tagline: {
    marginTop: parseInt(mobileTokens.space.sm, 10),
  },
  actions: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
    gap: parseInt(mobileTokens.space.md, 10),
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: parseInt(mobileTokens.space.md, 10),
  },
  dividerLine: {
    flex: 1,
    height: parseInt(mobileTokens.layout.divider, 10),
    backgroundColor: mobileTokens.border.subtle,
  },
  federatedGroup: {
    gap: parseInt(mobileTokens.space.sm, 10),
  },
  errorText: {
    color: mobileTokens.feedback.danger.fg,
    textAlign: "center",
  },
});
