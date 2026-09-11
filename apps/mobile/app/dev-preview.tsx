import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import type { ReactElement } from "react";
import { View, StyleSheet } from "react-native";

import { Button, Text, Screen } from "@avora/ui-mobile/primitives";
import { mobileTokens } from "@avora/ui-mobile/tokens";

type PreviewEntry = Readonly<{
  label: string;
  href: Href;
}>;

const PREVIEW_ENTRIES: readonly PreviewEntry[] = [
  { label: "Sign in", href: "/(auth)" },
  { label: "Sign in · Email", href: { pathname: "/(auth)/email" } },
  { label: "Sign in · Verify code", href: { pathname: "/(auth)/verify", params: { email: "you@example.com" } } },
  { label: "Onboarding · Welcome", href: "/(onboarding)/welcome" },
  { label: "Onboarding · Institution", href: "/(onboarding)/institution" },
  { label: "Onboarding · Programme", href: "/(onboarding)/programme" },
  { label: "Onboarding · Branch", href: "/(onboarding)/branch" },
  { label: "Onboarding · Term", href: "/(onboarding)/term" },
  { label: "Onboarding · Subjects", href: "/(onboarding)/subjects" },
  { label: "Onboarding · Structure", href: "/(onboarding)/structure" },
  { label: "Onboarding · Completion", href: "/(onboarding)/completion" },
  { label: "Home", href: "/home" },
  { label: "Subjects", href: "/subjects" },
  { label: "Notes", href: "/notes" },
  { label: "AI Tutor", href: "/tutor" },
  { label: "Planner", href: "/planner" },
  { label: "Profile", href: "/profile" },
];

/**
 * Dev-only screen inventory for visual QA — never a production surface.
 * Every entry is a plain `router.push` into an existing route; nothing here
 * persists a session, calls an auth endpoint, or changes what a screen
 * does. Screens gated on real data (Home, Term, Subjects, Structure,
 * Completion) will show their own honest loading/empty/error state when
 * there's no real signed-in session — this route does not fabricate one.
 */
export default function DevPreviewRoute(): ReactElement {
  const router = useRouter();

  if (!__DEV__) {
    return (
      <Screen contentContainerStyle={styles.disabledContent}>
        <Text variant="body" color="secondary">This screen is only available in development builds.</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="eyebrow" color="tertiary">Development only</Text>
        <Text variant="titleLg" color="primary" style={styles.title}>Screen preview</Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          Jump directly to any screen for visual QA. Never shown in a release build.
        </Text>
      </View>

      <View style={styles.list}>
        {PREVIEW_ENTRIES.map((entry) => (
          <Button
            key={entry.label}
            title={entry.label}
            intent="neutral"
            size="md"
            onPress={() => router.push(entry.href)}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  disabledContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    marginBottom: parseInt(mobileTokens.space.xl, 10),
  },
  title: {
    marginTop: parseInt(mobileTokens.space.sm, 10),
  },
  subtitle: {
    marginTop: parseInt(mobileTokens.space.md, 10),
  },
  list: {
    gap: parseInt(mobileTokens.space.sm, 10),
  },
});
