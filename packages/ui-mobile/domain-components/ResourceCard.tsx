import React, { type ReactElement } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { FileText } from "lucide-react-native";

import { Text } from "../primitives/Typography";
import { mobileTokens } from "../tokens/index";
import { ConfidenceIndicator } from "./ConfidenceIndicator";
import type { ResourceCardContract } from "./ResourceCard.contract";

type ResourceCardProps = ResourceCardContract & {
  onPress: () => void;
  onCorrect: () => void;
};

const ICON_SIZE_DP = 18;

/**
 * Rule UP-08: correction is always one tap — `correctionAction` renders as
 * a direct button, never a secondary menu. Vocabulary: `resource`, never
 * "file"/"document" (glossary §7).
 */
export function ResourceCard({
  title,
  classificationConfidenceRatio,
  correctionAction,
  onPress,
  onCorrect,
}: ResourceCardProps): ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.iconBadge}>
        <FileText size={ICON_SIZE_DP} color={mobileTokens.text.tertiary} />
      </View>

      <View style={styles.body}>
        <Text variant="bodyLg" color="primary" numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.footerRow}>
          <ConfidenceIndicator confidenceRatio={classificationConfidenceRatio} />

          <Pressable
            accessibilityRole="button"
            hitSlop={parseInt(mobileTokens.space.sm, 10)}
            onPress={onCorrect}
          >
            <Text variant="caption" color="secondary" style={styles.correctionLabel}>
              {correctionAction.label}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: parseInt(mobileTokens.space.md, 10),
    borderRadius: parseInt(mobileTokens.radius.lg, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: mobileTokens.border.subtle,
    backgroundColor: mobileTokens.surface.raised,
    padding: parseInt(mobileTokens.space.md, 10),
  },
  pressed: {
    opacity: parseFloat(mobileTokens.state.mutedOpacity),
  },
  iconBadge: {
    width: parseInt(mobileTokens.control.lg, 10),
    height: parseInt(mobileTokens.control.lg, 10),
    borderRadius: parseInt(mobileTokens.radius.md, 10),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: mobileTokens.surface.overlay,
  },
  body: {
    flex: 1,
    gap: parseInt(mobileTokens.space.sm, 10),
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  correctionLabel: {
    textDecorationLine: "underline",
  },
});
