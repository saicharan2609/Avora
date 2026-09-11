import type { ReactElement } from "react";
import { View, StyleSheet } from "react-native";
import { CalendarDays } from "lucide-react-native";

import { Text } from "@avora/ui-mobile/primitives";
import { mobileTokens } from "@avora/ui-mobile/tokens";

import { TabScreen } from "../src/navigation/TabScreen";

const ICON_SIZE_DP = 28;

/**
 * Planner is one of the five fixed bottom-nav destinations
 * (docs/DESIGN-SYSTEM.md §8.2, Rule N-01), but no `study_plan`/`plan_item`
 * port or screen exists yet — there is nothing real to show. An honest
 * "not built yet" state is correct here; a populated planner UI backed by
 * nothing would be a fabricated feature (§13/§21 of the UI implementation
 * brief).
 */
export default function PlannerRoute(): ReactElement {
  return (
    <TabScreen activeDestination="planner" contentContainerStyle={styles.content}>
      <View style={styles.iconBadge}>
        <CalendarDays size={ICON_SIZE_DP} color={mobileTokens.text.tertiary} />
      </View>
      <Text variant="titleMd" color="primary" style={styles.title}>
        Planner is on its way
      </Text>
      <Text variant="body" color="secondary" style={styles.message}>
        Study plans will show up here once they're ready.
      </Text>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBadge: {
    width: parseInt(mobileTokens.control.lg, 10) * 1.4,
    height: parseInt(mobileTokens.control.lg, 10) * 1.4,
    borderRadius: parseInt(mobileTokens.radius.full, 10),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: mobileTokens.surface.raised,
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: mobileTokens.border.subtle,
  },
  title: {
    marginTop: parseInt(mobileTokens.space.lg, 10),
    textAlign: "center",
  },
  message: {
    marginTop: parseInt(mobileTokens.space.sm, 10),
    textAlign: "center",
  },
});
