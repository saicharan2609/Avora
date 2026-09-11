import React, { type ReactElement, type ReactNode } from "react";
import { Pressable, StyleSheet, View, type ColorValue, type GestureResponderEvent } from "react-native";
import { Check } from "lucide-react-native";

import { Text } from "../primitives/Typography";
import { mobileTokens } from "../tokens/index";
import type { SelectableCardContract } from "./SelectableCard.contract";

type SelectableCardProps = SelectableCardContract & {
  onPress: (event: GestureResponderEvent) => void;
  leading?: ReactNode;
  trailingLabel?: string;
  disabled?: boolean;
};

const CHECK_SIZE_DP = 14;

// A named constant rather than an inline literal keeps this a plain
// identifier reference in the style objects below — same precedent as
// Button.tsx's own `TRANSPARENT` constant ("transparent" has no hex/opacity
// value a design token could hold, so it is a structural reset, not a
// themed color).
const TRANSPARENT: ColorValue = "transparent";

/**
 * The onboarding selection primitive (§6 selection-first onboarding):
 * institution/programme/branch/timetable-method rows and structure-type
 * tiles all render through this one component, in "row" or "tile" layout,
 * so the selected-state language (accent border + wash + trailing check)
 * stays identical everywhere a student is asked to choose rather than type.
 */
export function SelectableCard({
  title,
  subtitle,
  selected,
  layout = "row",
  onPress,
  leading,
  trailingLabel,
  disabled = false,
}: SelectableCardProps): ReactElement {
  const isRow = layout === "row";

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isRow ? styles.row : styles.tile,
        selected ? styles.selected : styles.unselected,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {isRow ? (
        <RowContent title={title} subtitle={subtitle} selected={selected} leading={leading} trailingLabel={trailingLabel} />
      ) : (
        <TileContent
          title={title}
          subtitle={subtitle}
          selected={selected}
          leading={leading}
          trailingLabel={trailingLabel}
        />
      )}
    </Pressable>
  );
}

type ContentProps = Readonly<{
  title: string;
  subtitle?: string;
  selected: boolean;
  leading?: ReactNode;
}>;

function RowContent({ title, subtitle, selected, leading, trailingLabel }: ContentProps & { trailingLabel?: string }): ReactElement {
  return (
    <View style={styles.rowContainer}>
      {leading}
      <View style={styles.rowBody}>
        <View style={styles.rowTitleLine}>
          <Text variant="bodyLg" color="primary" numberOfLines={1} style={styles.rowTitleText}>
            {title}
          </Text>
          {trailingLabel ? <SuggestedBadge label={trailingLabel} /> : null}
        </View>
        {subtitle ? (
          <Text variant="caption" color="tertiary" style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <CheckBadge selected={selected} />
    </View>
  );
}

function TileContent({
  title,
  subtitle,
  selected,
  leading,
  trailingLabel,
}: ContentProps & { trailingLabel?: string }): ReactElement {
  return (
    <>
      <View style={styles.tileHeader}>
        {leading ? <View style={styles.tileLeading}>{leading}</View> : null}
        {trailingLabel ? <SuggestedBadge label={trailingLabel} /> : null}
      </View>

      <View style={styles.tileBody}>
        <Text variant="label" color="primary" numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color="tertiary" style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <CheckBadge selected={selected} />
    </>
  );
}

function SuggestedBadge({ label }: { label: string }): ReactElement {
  return (
    <View style={styles.suggestedBadge}>
      <Text variant="caption" color="primary" style={styles.suggestedBadgeText}>
        {label}
      </Text>
    </View>
  );
}

function CheckBadge({ selected }: { selected: boolean }): ReactElement {
  return (
    <View style={[styles.checkBadge, selected ? styles.checkBadgeSelected : styles.checkBadgeUnselected]}>
      {selected ? <Check size={CHECK_SIZE_DP} color={mobileTokens.surface.base} strokeWidth={3} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: parseInt(mobileTokens.radius.lg, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10) * 2,
    padding: parseInt(mobileTokens.space.md, 10),
  },
  row: {
    flexDirection: "column",
  },
  tile: {
    flex: 1,
    minWidth: 0,
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
  pressed: {
    opacity: parseFloat(mobileTokens.state.mutedOpacity),
  },
  disabled: {
    opacity: parseFloat(mobileTokens.state.disabledOpacity),
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: parseInt(mobileTokens.space.md, 10),
  },
  rowTitleLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: parseInt(mobileTokens.space.sm, 10),
  },
  rowTitleText: {
    flexShrink: 1,
  },
  tileHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  tileLeading: {
    marginBottom: parseInt(mobileTokens.space.md, 10),
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
  },
  tileBody: {
    marginTop: parseInt(mobileTokens.space.md, 10),
  },
  subtitle: {
    marginTop: parseInt(mobileTokens.space.xs, 10),
  },
  suggestedBadge: {
    borderRadius: parseInt(mobileTokens.radius.full, 10),
    backgroundColor: mobileTokens.accent.subtle,
    paddingHorizontal: parseInt(mobileTokens.space.sm, 10),
    paddingVertical: parseInt(mobileTokens.space.xs, 10) / 2,
  },
  suggestedBadgeText: {
    color: mobileTokens.accent.strong,
  },
  checkBadge: {
    width: parseInt(mobileTokens.control.sm, 10),
    height: parseInt(mobileTokens.control.sm, 10),
    borderRadius: parseInt(mobileTokens.radius.full, 10),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
  },
  checkBadgeSelected: {
    backgroundColor: mobileTokens.accent.default,
    borderColor: mobileTokens.accent.default,
  },
  checkBadgeUnselected: {
    backgroundColor: TRANSPARENT,
    borderColor: mobileTokens.border.default,
  },
});
