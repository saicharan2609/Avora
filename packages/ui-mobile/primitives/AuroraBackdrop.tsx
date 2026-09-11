import React, { type ReactElement } from "react";
import { StyleSheet, View, type DimensionValue } from "react-native";
import Svg, { Circle, Defs, Ellipse, RadialGradient, Stop } from "react-native-svg";

import { mobileTokens } from "../tokens/index";

type AuroraBackdropVariant = "aurora" | "hero";

type AuroraBackdropProps = {
  // "aurora" (default) is the top-band chrome wash used on dashboard-style
  // screens (Home, Subject detail), ported from the reference's `.aurora`
  // utility. "hero" is the two-blob top+bottom glow the reference's
  // auth-shell (welcome/login) uses instead — a visually different source,
  // not a re-skin of the same one.
  variant?: AuroraBackdropVariant;
};

const AURORA_HEIGHT_DP = 320;

export function AuroraBackdrop({ variant = "aurora" }: AuroraBackdropProps): ReactElement {
  if (variant === "hero") {
    return <HeroGlow />;
  }

  return (
    <View style={styles.auroraContainer} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 100 60" preserveAspectRatio="none">
        <Defs>
          <RadialGradient id="auroraPrimary" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={mobileTokens.accent.default} stopOpacity={0.17} />
            <Stop offset="0.58" stopColor={mobileTokens.accent.default} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="auroraSecondary" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={mobileTokens.accent.default} stopOpacity={0.08} />
            <Stop offset="0.6" stopColor={mobileTokens.accent.default} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx="8" cy="-10" rx="60" ry="35" fill="url(#auroraPrimary)" />
        <Ellipse cx="94" cy="-6" rx="50" ry="30" fill="url(#auroraSecondary)" />
      </Svg>
    </View>
  );
}

// Two off-canvas soft circles — a large, brighter one anchored above the
// top edge, a smaller, dimmer one anchored beyond the bottom-right corner —
// reproducing the reference auth-shell's `aura-glow`/ellipse pair rather
// than the dashboard's single top-band wash.
function HeroGlow(): ReactElement {
  return (
    <View style={styles.heroContainer} pointerEvents="none">
      <GlowBlob sizeDp={420} opacity={0.16} style={styles.heroTopBlob} />
      <GlowBlob sizeDp={320} opacity={0.09} style={styles.heroBottomBlob} />
    </View>
  );
}

function GlowBlob({ sizeDp, opacity, style }: { sizeDp: number; opacity: number; style: { position: "absolute"; top?: DimensionValue; bottom?: DimensionValue; left?: DimensionValue; right?: DimensionValue } }): ReactElement {
  const gradientId = `heroGlow-${sizeDp}-${opacity}`;

  return (
    <View style={[{ width: sizeDp, height: sizeDp }, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id={gradientId} cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={mobileTokens.accent.default} stopOpacity={opacity} />
            <Stop offset="1" stopColor={mobileTokens.accent.default} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="50" fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  auroraContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: AURORA_HEIGHT_DP,
  },
  heroContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroTopBlob: {
    position: "absolute",
    top: -210,
    left: "50%",
    marginLeft: -210,
  },
  heroBottomBlob: {
    position: "absolute",
    bottom: -220,
    right: -140,
  },
});
