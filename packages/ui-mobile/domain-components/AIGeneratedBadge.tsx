import React, { type ReactElement } from "react";
import { StyleSheet, View } from "react-native";
import { Sparkles } from "lucide-react-native";

import { Text } from "../primitives/Typography";
import { mobileTokens } from "../tokens/index";
import type { AIGeneratedBadgeContract } from "./AIGeneratedBadge.contract";

const ICON_SIZE_DP = 11;

/**
 * NN-08: every AI-generated artifact carries this badge at every point of
 * presentation, including export. `ai.provenance.accent` is reserved
 * exclusively for this signal (Rule C-06) — never reused for a plain
 * primary/brand accent elsewhere.
 */
export function AIGeneratedBadge(_props: AIGeneratedBadgeContract): ReactElement {
  return (
    <View style={styles.badge} accessibilityLabel="AI generated">
      <Sparkles size={ICON_SIZE_DP} color={mobileTokens.ai.provenance.accent} />
      <Text variant="caption" style={styles.label}>
        AI generated
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: parseInt(mobileTokens.space.xs, 10),
    alignSelf: "flex-start",
    borderRadius: parseInt(mobileTokens.radius.full, 10),
    backgroundColor: mobileTokens.accent.subtle,
    paddingHorizontal: parseInt(mobileTokens.space.sm, 10),
    paddingVertical: parseInt(mobileTokens.space.xs, 10) / 2,
  },
  label: {
    color: mobileTokens.ai.provenance.accent,
    fontWeight: "600",
  },
});
