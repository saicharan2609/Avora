import React, { type ReactElement } from "react";
import { StyleSheet, View } from "react-native";

import { mobileTokens } from "../tokens/index";
import type { ConfidenceIndicatorContract } from "./ConfidenceIndicator.contract";

const SEGMENT_COUNT = 3;

/**
 * Rule UP-04 (docs/DESIGN-SYSTEM.md §33.4): classification confidence is
 * never shown as a percentage. This renders a purely visual 3-segment
 * indicator instead of a number — the segment count is derived from the
 * ratio, but no numeric value is ever printed to the screen.
 */
export function ConfidenceIndicator({ confidenceRatio }: ConfidenceIndicatorContract): ReactElement {
  const clampedRatio = Math.min(1, Math.max(0, confidenceRatio));
  const filledSegmentCount = Math.max(1, Math.round(clampedRatio * SEGMENT_COUNT));

  return (
    <View
      style={styles.row}
      accessibilityRole="progressbar"
      accessibilityLabel="Classification confidence"
      accessibilityValue={{ min: 0, max: SEGMENT_COUNT, now: filledSegmentCount }}
    >
      {Array.from({ length: SEGMENT_COUNT }, (_, index) => (
        <View
          key={index}
          style={[styles.segment, index < filledSegmentCount ? styles.filled : styles.empty]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: parseInt(mobileTokens.space.xs, 10) / 2,
  },
  segment: {
    width: parseInt(mobileTokens.space.lg, 10),
    height: 3,
    borderRadius: parseInt(mobileTokens.radius.full, 10),
  },
  filled: {
    backgroundColor: mobileTokens.accent.default,
  },
  empty: {
    backgroundColor: mobileTokens.border.subtle,
  },
});
