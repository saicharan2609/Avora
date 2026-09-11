import React, { type ReactElement } from "react";
import { StyleSheet, View } from "react-native";

import { Text } from "../primitives/Typography";
import { mobileTokens } from "../tokens/index";
import type { MasteryMeterContract } from "./MasteryMeter.contract";

const SIGNAL_ORDER: readonly MasteryMeterContract["masterySignal"][] = [
  "not_observed",
  "emerging",
  "developing",
  "secure",
];

const LABEL_BY_SIGNAL: Record<MasteryMeterContract["masterySignal"], string> = {
  not_observed: "Not yet observed",
  emerging: "Emerging",
  developing: "Developing",
  secure: "Secure",
};

/**
 * `mastery_signal`, never a numeric score/grade (glossary §7): a 4-step
 * qualitative meter using the enum's own vocabulary as its only label —
 * no synthesized percentage or letter grade.
 */
export function MasteryMeter({ masterySignal }: MasteryMeterContract): ReactElement {
  const filledStepCount = SIGNAL_ORDER.indexOf(masterySignal) + 1;

  return (
    <View>
      <View style={styles.row}>
        {SIGNAL_ORDER.map((signal, index) => (
          <View
            key={signal}
            style={[styles.segment, index < filledStepCount ? styles.filled : styles.empty]}
          />
        ))}
      </View>
      <Text variant="caption" color="tertiary" style={styles.label}>
        {LABEL_BY_SIGNAL[masterySignal]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: parseInt(mobileTokens.space.xs, 10) / 2,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: parseInt(mobileTokens.radius.full, 10),
  },
  filled: {
    backgroundColor: mobileTokens.accent.default,
  },
  empty: {
    backgroundColor: mobileTokens.border.subtle,
  },
  label: {
    marginTop: parseInt(mobileTokens.space.xs, 10),
  },
});
