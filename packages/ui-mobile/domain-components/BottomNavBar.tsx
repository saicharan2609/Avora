import React, { type ReactElement } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BookOpen, CalendarDays, House, Sparkles, User, type LucideIcon } from "lucide-react-native";

import { GlassSurface } from "../primitives/GlassSurface";
import { Text } from "../primitives/Typography";
import { mobileTokens } from "../tokens/index";
import type { BottomNavBarContract, BottomNavDestination } from "./BottomNavBar.contract";

type BottomNavBarProps = BottomNavBarContract & {
  onNavigate: (destination: BottomNavDestination) => void;
};

const ICON_SIZE_DP = 19;

// Five fixed destinations, never reordered or configurable
// (docs/DESIGN-SYSTEM.md §8.2, Recommendation N-01).
const DESTINATIONS: ReadonlyArray<{ destination: BottomNavDestination; label: string; icon: LucideIcon }> = [
  { destination: "home", label: "Home", icon: House },
  { destination: "subjects", label: "Subjects", icon: BookOpen },
  { destination: "tutor", label: "AI", icon: Sparkles },
  { destination: "planner", label: "Planner", icon: CalendarDays },
  { destination: "profile", label: "Profile", icon: User },
];

/**
 * The fixed floating bottom navigation bar (UI-REFERENCE-DIRECTION.md §5,
 * §8.5): every top-level surface renders this as a sibling overlay, not a
 * native tab-bar chrome, so it can match the reference's rounded, elevated
 * pill exactly. Active state uses three simultaneous signals — filled icon,
 * accent icon color and accent label color — never color alone (Rule C-02).
 */
export function BottomNavBar({ activeDestination, onNavigate }: BottomNavBarProps): ReactElement {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, parseInt(mobileTokens.space.sm, 10)) }]} pointerEvents="box-none">
      <View style={styles.shadowWrapper}>
      <GlassSurface style={styles.bar} borderRadiusDp={parseInt(mobileTokens.radius.xl, 10)}>
        {DESTINATIONS.map(({ destination, label, icon: Icon }) => {
          const isActive = destination === activeDestination;

          return (
            <Pressable
              key={destination}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={label}
              onPress={() => onNavigate(destination)}
              style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
            >
              <Icon
                size={ICON_SIZE_DP}
                color={isActive ? mobileTokens.accent.default : mobileTokens.text.tertiary}
                fill={isActive ? mobileTokens.accent.default : "none"}
                strokeWidth={isActive ? 0 : 2}
              />
              <Text variant="caption" color={isActive ? "primary" : "tertiary"} style={isActive && styles.activeLabel}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </GlassSurface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: parseInt(mobileTokens.space.md, 10),
  },
  // Shadow lives on a non-clipping wrapper: GlassSurface itself needs
  // overflow:hidden to clip the blur to its rounded corners, which would
  // otherwise also clip an iOS shadow drawn on the same layer.
  shadowWrapper: {
    borderRadius: parseInt(mobileTokens.radius.xl, 10),
    shadowColor: mobileTokens.shadow.overlay.color,
    shadowOffset: { width: 0, height: mobileTokens.shadow.overlay.offsetY },
    shadowOpacity: mobileTokens.shadow.overlay.opacity,
    shadowRadius: mobileTokens.shadow.overlay.radius,
    elevation: mobileTokens.shadow.overlay.elevation,
  },
  bar: {
    flexDirection: "row",
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: mobileTokens.border.default,
    paddingVertical: parseInt(mobileTokens.space.sm, 10),
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: parseInt(mobileTokens.space.xs, 10) / 2,
    paddingVertical: parseInt(mobileTokens.space.xs, 10),
  },
  pressed: {
    opacity: parseFloat(mobileTokens.state.mutedOpacity),
  },
  activeLabel: {
    color: mobileTokens.accent.default,
    fontWeight: "600",
  },
});
