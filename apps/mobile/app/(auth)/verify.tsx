import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { Pressable, View, StyleSheet, TextInput } from "react-native";
import { ArrowLeft } from "lucide-react-native";

import { getAuthPort, getSecureSessionStore } from "../../src/composition";
import { AvoraMark, Button, Text, Input, Screen } from "@avora/ui-mobile/primitives";
import { mobileTokens } from "@avora/ui-mobile/tokens";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;
const BACK_ICON_SIZE_DP = 18;
const MARK_SIZE_DP = 40;

/**
 * OTP verification UI only. `verifyEmailOtp` and the resend path both call
 * the real AuthPort contract (packages/domain/identity/ports/AuthPort.ts) —
 * nothing here is invented. `verifyEmailOtp` currently throws
 * `MobileAuthPortNotYetAvailableError` from httpAuthPort.ts because the
 * mobile OTP-verification API route doesn't exist yet; that is surfaced
 * honestly as the error state below rather than papered over, per the
 * deferred-backend boundary for this pass.
 */
export default function OtpVerifyRoute(): ReactElement {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const emailAddress = email ?? "";

  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(RESEND_COOLDOWN_SECONDS);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (resendCooldownSeconds <= 0) {
      return;
    }

    const timer = setTimeout(() => setResendCooldownSeconds((seconds) => seconds - 1), 1000);

    return () => clearTimeout(timer);
  }, [resendCooldownSeconds]);

  async function verifyCode(code: string): Promise<void> {
    setErrorMessage(null);
    setIsVerifying(true);

    try {
      const session = await getAuthPort().verifyEmailOtp({ email: emailAddress, token: code });
      await getSecureSessionStore().writeSession(session);
      router.replace("/(onboarding)/welcome");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not verify that code.");
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  }

  function handleChangeDigit(index: number, rawText: string): void {
    const sanitized = rawText.replace(/[^0-9]/g, "").slice(-1);

    setErrorMessage(null);

    const next = [...digits];
    next[index] = sanitized;
    setDigits(next);

    if (sanitized.length > 0 && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (sanitized.length > 0 && next.every((digit) => digit.length === 1)) {
      void verifyCode(next.join(""));
    }
  }

  function handleKeyPress(index: number, key: string): void {
    if (key === "Backspace" && digits[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function resendCode(): Promise<void> {
    if (resendCooldownSeconds > 0 || isResending) {
      return;
    }

    setErrorMessage(null);
    setIsResending(true);

    try {
      await getAuthPort().startEmailMagicLink({ email: emailAddress, redirectTo: "avora://auth-callback" });
      setResendCooldownSeconds(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not resend the code.");
    } finally {
      setIsResending(false);
    }
  }

  const resendLabel = resendCooldownSeconds > 0
    ? `Resend code · 0:${String(resendCooldownSeconds).padStart(2, "0")}`
    : "Resend code";

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
        <Text variant="display" color="primary" style={styles.title}>Enter verification code</Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          We sent a 6-digit code to {emailAddress}.
        </Text>
      </View>

      <View style={styles.otpRow}>
        {digits.map((digit, index) => (
          <Input
            key={index}
            ref={(node) => {
              inputRefs.current[index] = node;
            }}
            value={digit}
            onChangeText={(text) => handleChangeDigit(index, text)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
            keyboardType="number-pad"
            maxLength={1}
            state={errorMessage !== null ? "error" : "default"}
            style={styles.otpBox}
            autoFocus={index === 0}
          />
        ))}
      </View>

      {errorMessage !== null ? (
        <Text variant="caption" style={styles.errorText}>{errorMessage}</Text>
      ) : isVerifying ? (
        <Text variant="caption" color="tertiary" style={styles.statusText}>Verifying…</Text>
      ) : null}

      <View style={styles.footer}>
        <Text variant="caption" color="tertiary" style={styles.resendPrompt}>Didn't receive it?</Text>

        <Button
          title={resendLabel}
          intent="neutral"
          size="md"
          state={resendCooldownSeconds > 0 ? "disabled" : isResending ? "loading" : "default"}
          onPress={() => void resendCode()}
        />

        <Button
          title="Change email"
          intent="tertiary"
          size="md"
          onPress={() => router.back()}
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
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  otpBox: {
    width: parseInt(mobileTokens.control.lg, 10),
    height: parseInt(mobileTokens.control.lg, 10),
    paddingHorizontal: 0,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  statusText: {
    marginTop: parseInt(mobileTokens.space.md, 10),
    textAlign: "center",
  },
  errorText: {
    color: mobileTokens.feedback.danger.fg,
    marginTop: parseInt(mobileTokens.space.md, 10),
    textAlign: "center",
  },
  footer: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
    alignItems: "center",
    gap: parseInt(mobileTokens.space.sm, 10),
  },
  resendPrompt: {
    marginBottom: parseInt(mobileTokens.space.xs, 10),
  },
});
