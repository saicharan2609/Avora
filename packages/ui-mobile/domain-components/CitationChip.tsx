import React, { type ReactElement } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { FileText } from "lucide-react-native";

import { Text } from "../primitives/Typography";
import { mobileTokens } from "../tokens/index";
import type { CitationChipContract } from "./CitationChip.contract";

type CitationChipProps = CitationChipContract & {
  resourceTitle: string;
  onPress: () => void;
};

const ICON_SIZE_DP = 14;

/**
 * NN-11: a citation is a foreign key, never a free-text string — this chip
 * only ever renders from a machine-resolved `CitationChipContract`, and
 * `onPress` is required so every citation opens the source viewer at its
 * exact locator (FR-052). There is no variant that accepts a bare string.
 */
export function CitationChip({ citation, resourceTitle, onPress }: CitationChipProps): ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open source: ${resourceTitle}, ${citation.locator}`}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
    >
      <View style={styles.iconBadge}>
        <FileText size={ICON_SIZE_DP} color={mobileTokens.text.tertiary} />
      </View>
      <View style={styles.textBlock}>
        <Text variant="label" color="primary" numberOfLines={1}>
          {resourceTitle}
        </Text>
        <Text variant="caption" color="tertiary" numberOfLines={1}>
          {citation.locator}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: parseInt(mobileTokens.space.sm, 10),
    borderRadius: parseInt(mobileTokens.radius.md, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: mobileTokens.border.subtle,
    backgroundColor: mobileTokens.surface.overlay,
    paddingHorizontal: parseInt(mobileTokens.space.md, 10),
    paddingVertical: parseInt(mobileTokens.space.sm, 10),
  },
  pressed: {
    opacity: parseFloat(mobileTokens.state.mutedOpacity),
  },
  iconBadge: {
    width: parseInt(mobileTokens.control.sm, 10),
    height: parseInt(mobileTokens.control.sm, 10),
    borderRadius: parseInt(mobileTokens.radius.sm, 10),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: mobileTokens.surface.raised,
  },
  textBlock: {
    flex: 1,
  },
});
