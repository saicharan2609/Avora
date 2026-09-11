import React, { type ReactElement } from "react";
import { StyleSheet, View } from "react-native";

import { Text } from "../primitives/Typography";
import { mobileTokens } from "../tokens/index";
import type { InitialsTokenContract } from "./InitialsToken.contract";

type InitialsTokenProps = InitialsTokenContract & {
  sizeDp?: number;
};

/**
 * A short-code avatar chip (institution/branch/subject initials) reused
 * across onboarding selection rows and subject cards (Rule ENG-035 — this
 * pattern recurs on 3+ surfaces, so it is a component rather than inlined
 * markup each time). The "squircle" shape is always accent-tinted with a
 * monospace label, matching the reference's non-interactive subject-card
 * badge; "circle" is the selection-row avatar whose tint follows `active`.
 */
export function InitialsToken({ label, active = false, sizeDp, shape = "circle" }: InitialsTokenProps): ReactElement {
  const resolvedSize = sizeDp ?? parseInt(mobileTokens.control.md, 10);
  const isSquircle = shape === "squircle";
  const isAccentTinted = active || isSquircle;
  const borderRadius = isSquircle ? parseInt(mobileTokens.radius.md, 10) : resolvedSize / 2;

  return (
    <View
      style={[
        styles.base,
        { width: resolvedSize, height: resolvedSize, borderRadius },
        isAccentTinted ? styles.active : styles.inactive,
      ]}
    >
      <Text
        variant="label"
        color={isAccentTinted ? "accent" : "tertiary"}
        fontFamily={isSquircle ? "mono" : "sans"}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  active: {
    backgroundColor: mobileTokens.accent.subtle,
  },
  inactive: {
    backgroundColor: mobileTokens.surface.overlay,
  },
});
