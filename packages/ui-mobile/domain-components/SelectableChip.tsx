import React, { type ReactElement } from "react";
import { Pressable, StyleSheet, type GestureResponderEvent } from "react-native";

import { Text } from "../primitives/Typography";
import { mobileTokens } from "../tokens/index";
import type { SelectableChipContract } from "./SelectableChip.contract";

type SelectableChipProps = SelectableChipContract & {
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
};

/**
 * A single-select pill used in a horizontal `role="radiogroup"` row (academic
 * year, current year, semester — §6 selection-first onboarding). Reuses the
 * same accent-tint selected language as SelectableCard at a smaller scale.
 */
export function SelectableChip({ label, selected, onPress, disabled = false }: SelectableChipProps): ReactElement {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        selected ? styles.selected : styles.unselected,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text variant="label" color={selected ? "primary" : "secondary"} style={selected && styles.selectedText}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: parseInt(mobileTokens.control.lg, 10),
    borderRadius: parseInt(mobileTokens.radius.full, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10) * 2,
    paddingHorizontal: parseInt(mobileTokens.space.lg, 10),
    alignItems: "center",
    justifyContent: "center",
  },
  // The glow is a deliberate, scoped exception to Rule EL-01 — see
  // shadow.accentGlow's own comment in packages/design-tokens/tier-2.
  selected: {
    borderColor: mobileTokens.accent.default,
    backgroundColor: mobileTokens.accent.subtle,
    shadowColor: mobileTokens.shadow.accentGlow.color,
    shadowOffset: { width: 0, height: mobileTokens.shadow.accentGlow.offsetY },
    shadowOpacity: mobileTokens.shadow.accentGlow.opacity,
    shadowRadius: mobileTokens.shadow.accentGlow.radius,
    elevation: mobileTokens.shadow.accentGlow.elevation,
  },
  unselected: {
    borderColor: mobileTokens.border.subtle,
    backgroundColor: mobileTokens.surface.raised,
  },
  selectedText: {
    color: mobileTokens.accent.strong,
  },
  pressed: {
    opacity: parseFloat(mobileTokens.state.mutedOpacity),
  },
  disabled: {
    opacity: parseFloat(mobileTokens.state.disabledOpacity),
  },
});
