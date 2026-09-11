import { useState } from "react";
import type { ReactElement } from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

import { getAuthPort } from "../../src/composition";
import { AvoraMark, Button, Text, Input, Screen } from "@avora/ui-mobile/primitives";
import { mobileTokens } from "@avora/ui-mobile/tokens";

const BACK_ICON_SIZE_DP = 18;
const MARK_SIZE_DP = 40;

/**
 * Dispatches the existing email_magic_link send path only — the same
 * `/api/auth/magic-link` route now doubles as "send a code" for the OTP UI
 * (packages/domain/identity/ports/AuthPort.ts already models
 * `verifyEmailOtp` for the next step). Whether the delivered email contains
 * a tappable link or a 6-digit code is a backend/template concern outside
 * this UI-only pass; verify.tsx's `verifyEmailOtp` call is real and ready
 * for whichever the backend ultimately sends.
 */
export default function EmailSignInRoute(): ReactElement {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function sendCode(): Promise<void> {
    const trimmedEmail = email.trim();

    setErrorMessage(null);
    setIsSending(true);

    try {
      await getAuthPort().startEmailMagicLink({
        email: trimmedEmail,
        redirectTo: "avora://auth-callback",
      });
      router.push({ pathname: "/(auth)/verify", params: { email: trimmedEmail } });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not send your code.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Screen scroll>
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          hitSlop={parseInt(mobileTokens.space.sm, 10)}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <ArrowLeft size={BACK_ICON_SIZE_DP} color={mobileTokens.text.primary} />
        </Pressable>
        <AvoraMark sizeDp={MARK_SIZE_DP} />
      </View>

      <View style={styles.header}>
        <Text variant="display" color="primary" style={styles.title}>Sign in with email</Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          We'll send a 6-digit code to verify it's you.
        </Text>
      </View>

      <Input
        label="Email address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="you@example.com"
        state={errorMessage ? "error" : "default"}
        errorMessage={errorMessage || undefined}
      />

      <View style={styles.actions}>
        <Button
          title="Continue"
          intent="primary"
          size="lg"
          state={isSending ? "loading" : email.trim().length === 0 ? "disabled" : "default"}
          onPress={() => void sendCode()}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: parseInt(mobileTokens.space.md, 10),
  },
  backButton: {
    width: parseInt(mobileTokens.control.md, 10),
    height: parseInt(mobileTokens.control.md, 10),
    borderRadius: parseInt(mobileTokens.radius.full, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: mobileTokens.border.default,
    backgroundColor: mobileTokens.surface.raised,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: parseFloat(mobileTokens.state.mutedOpacity),
  },
  header: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
    marginBottom: parseInt(mobileTokens.space.xl, 10),
  },
  title: {
    marginTop: parseInt(mobileTokens.space.sm, 10),
  },
  subtitle: {
    marginTop: parseInt(mobileTokens.space.md, 10),
  },
  actions: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
    gap: parseInt(mobileTokens.space.sm, 10),
  },
});
