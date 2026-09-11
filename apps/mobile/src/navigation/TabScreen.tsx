import type { ReactElement, ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import type { BottomNavDestination } from "@avora/ui-mobile/domain-components";
import { BottomNavBar } from "@avora/ui-mobile/domain-components";
import { Screen } from "@avora/ui-mobile/primitives";
import { mobileTokens } from "@avora/ui-mobile/tokens";

import { useBottomNavigation } from "./useBottomNavigation";

type TabScreenProps = Readonly<{
  activeDestination: BottomNavDestination;
  children: ReactNode;
  scroll?: boolean;
  glow?: boolean;
  // Rendered above the scrolling content, outside the ScrollView — for a
  // screen whose reference counterpart has a sticky/glass header (e.g.
  // Notes) rather than one that scrolls away with the rest of the page.
  header?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}>;

// The floating BottomNavBar's own control height, its internal vertical
// padding, Screen's usual scroll buffer, and a breathing-room margin above
// the bar — computed once here so every tab screen clears it by the exact
// same amount (previously each screen approximated this independently,
// Rule ENG-035/046).
const BOTTOM_NAV_CLEARANCE_DP =
  parseInt(mobileTokens.control.lg, 10) +
  parseInt(mobileTokens.space.sm, 10) * 2 +
  parseInt(mobileTokens.space.xxl, 10) +
  parseInt(mobileTokens.space.md, 10);

/**
 * The shared layout every one of the five bottom-nav destinations renders
 * inside: a `Screen` whose scroll content clears the floating `BottomNavBar`
 * by a fixed, single-sourced amount, with the bar itself as a sibling
 * overlay. Centralising this means every tab screen's nav-bar clearance is
 * pixel-identical instead of five independently approximated constants.
 */
export function TabScreen({
  activeDestination,
  children,
  scroll = true,
  glow = false,
  header,
  contentContainerStyle,
}: TabScreenProps): ReactElement {
  const nav = useBottomNavigation(activeDestination);

  return (
    <View style={styles.flexFill}>
      <Screen
        scroll={scroll}
        glow={glow}
        header={header}
        contentContainerStyle={[styles.defaultContentContainer, contentContainerStyle]}
      >
        {children}
      </Screen>
      <BottomNavBar {...nav} />
    </View>
  );
}

const styles = StyleSheet.create({
  flexFill: {
    flex: 1,
  },
  defaultContentContainer: {
    paddingBottom: BOTTOM_NAV_CLEARANCE_DP,
  },
});
