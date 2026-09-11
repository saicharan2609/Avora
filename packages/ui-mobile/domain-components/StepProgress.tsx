import React, { type ReactElement } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ArrowLeft } from "lucide-react-native";

import { Text } from "../primitives/Typography";
import { mobileTokens } from "../tokens/index";
import type { StepProgressContract } from "./StepProgress.contract";

type StepProgressProps = StepProgressContract & {
  onBack?: () => void;
};

const BACK_ICON_SIZE_DP = 18;

/**
 * The onboarding step header (Rule OB-01: one decision per step with
 * visible progress): a circular back control, a "Step N of Total" readout,
 * and a segmented bar — one filled pill per step, matching the reference's
 * cascading-completion read rather than a single continuous fill.
 */
export function StepProgress({ currentStepNumber, totalStepCount, onBack }: StepProgressProps): ReactElement {
  const percentComplete = Math.round((currentStepNumber / totalStepCount) * 100);
  const segments = Array.from({ length: totalStepCount }, (_, index) => index < currentStepNumber);

  return (
    <View>
      <View style={styles.headerRow}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={onBack}
            hitSlop={parseInt(mobileTokens.space.sm, 10)}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <ArrowLeft size={BACK_ICON_SIZE_DP} color={mobileTokens.text.primary} />
          </Pressable>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}

        <Text variant="eyebrow" color="tertiary" style={styles.stepLabel}>
          Step {currentStepNumber} of {totalStepCount}
        </Text>

        <Text variant="eyebrow" color="accent" fontFamily="mono" style={styles.percentLabel}>
          {percentComplete}%
        </Text>
      </View>

      <View style={styles.track}>
        {segments.map((isFilled, index) => (
          <View
            key={index}
            style={[styles.segment, isFilled ? styles.segmentFilled : styles.segmentEmpty]}
          />
        ))}
      </View>
    </View>
  );
}

const BUTTON_SIZE_DP = parseInt(mobileTokens.control.md, 10);

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: parseInt(mobileTokens.space.sm, 10),
  },
  backButton: {
    width: BUTTON_SIZE_DP,
    height: BUTTON_SIZE_DP,
    borderRadius: parseInt(mobileTokens.radius.full, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: mobileTokens.border.default,
    backgroundColor: mobileTokens.surface.raised,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonPlaceholder: {
    width: BUTTON_SIZE_DP,
    height: BUTTON_SIZE_DP,
  },
  pressed: {
    opacity: parseFloat(mobileTokens.state.mutedOpacity),
  },
  stepLabel: {
    flex: 1,
    textAlign: "left",
  },
  percentLabel: {
    fontVariant: ["tabular-nums"],
  },
  track: {
    flexDirection: "row",
    gap: parseInt(mobileTokens.space.xs, 10),
    marginTop: parseInt(mobileTokens.space.md, 10),
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: parseInt(mobileTokens.radius.full, 10),
  },
  segmentFilled: {
    backgroundColor: mobileTokens.accent.default,
  },
  segmentEmpty: {
    backgroundColor: mobileTokens.border.subtle,
  },
});
