import React, { type ReactElement, type ReactNode, useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { mobileTokens } from "../tokens/index";
import type { ReadinessRingContract } from "./ReadinessRing.contract";

type ReadinessRingProps = ReadinessRingContract & {
  sizeDp?: number;
  strokeWidthDp?: number;
  children?: ReactNode;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * The radial readiness/progress ring (UI-REFERENCE-DIRECTION.md §8.2): a
 * background track plus a rounded-cap progress stroke, rotated so the arc
 * starts at 12 o'clock and sweeps clockwise. Used for exam readiness,
 * per-subject progress and attendance — one component, never duplicated
 * per surface (Rule ENG-035).
 */
export function ReadinessRing({
  progressRatio,
  sizeDp = 64,
  strokeWidthDp = 6,
  children,
}: ReadinessRingProps): ReactElement {
  const clampedRatio = Math.min(1, Math.max(0, progressRatio));
  const radius = (sizeDp - strokeWidthDp) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedRatio = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // SVG stroke props aren't part of RN's native-driver whitelist, so this
    // runs on the JS thread — acceptable since it fires once per mount, not
    // on every frame of a scroll (NFR-052).
    Animated.timing(animatedRatio, {
      toValue: clampedRatio,
      duration: parseInt(mobileTokens.motion.slow, 10) * 3,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [clampedRatio, animatedRatio]);

  const strokeDashoffset = animatedRatio.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View
      style={{ width: sizeDp, height: sizeDp }}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clampedRatio * 100) }}
    >
      <Svg width={sizeDp} height={sizeDp} style={styles.rotated}>
        <Circle
          cx={sizeDp / 2}
          cy={sizeDp / 2}
          r={radius}
          stroke={mobileTokens.border.subtle}
          strokeWidth={strokeWidthDp}
          fill="none"
        />
        <AnimatedCircle
          cx={sizeDp / 2}
          cy={sizeDp / 2}
          r={radius}
          stroke={mobileTokens.accent.default}
          strokeWidth={strokeWidthDp}
          fill="none"
          strokeDasharray={`${circumference}, ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      {children ? (
        <View style={styles.centerContent} pointerEvents="none">
          {children}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  rotated: {
    transform: [{ rotate: "-90deg" }],
  },
  centerContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
