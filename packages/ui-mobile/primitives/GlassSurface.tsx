import React, { type ReactElement, type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { BlurView } from "expo-blur";

import { mobileTokens } from "../tokens/index";

type GlassSurfaceProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  borderRadiusDp?: number;
};

const BLUR_INTENSITY = 40;

/**
 * Real frosted-glass chrome — ported from the reference's `.glass` utility
 * (a translucent elevated-surface tint behind a 20-pixel backdrop blur).
 * Per docs/DESIGN-SYSTEM.md §16.2, glass is chrome-only: this must never
 * wrap a card, list row, sheet body or dialog — only nav bars and sticky
 * headers. The blur layer alone doesn't reliably tint dark enough on every
 * platform, so a translucent surface-tinted layer sits on top of it to
 * approximate the reference's color-mix.
 */
export function GlassSurface({ children, style, borderRadiusDp }: GlassSurfaceProps): ReactElement {
  return (
    <View style={[styles.container, borderRadiusDp !== undefined && { borderRadius: borderRadiusDp }, style]}>
      <BlurView intensity={BLUR_INTENSITY} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.tint]} pointerEvents="none" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  tint: {
    backgroundColor: `${mobileTokens.surface.overlay}99`,
  },
});
