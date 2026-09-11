import React, { type ReactElement, type ReactNode } from "react";
import { View, StyleSheet, type ViewProps } from "react-native";
import { mobileTokens } from "../tokens/index";

type CardProps = ViewProps & {
  children?: ReactNode;
  variant?: "base" | "raised" | "sunken" | "overlay";
  padded?: boolean;
};

export function Card({ children, variant = "raised", padded = true, style, ...props }: CardProps): ReactElement {
  return (
    <View
      style={[
        styles.base,
        variant === "base" && styles.baseVariant,
        variant === "raised" && styles.raised,
        variant === "sunken" && styles.sunken,
        variant === "overlay" && styles.overlay,
        padded && styles.padded,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    // docs/DESIGN-SYSTEM.md §15.1 — radius.lg is the default card radius;
    // radius.xl is reserved for hero/prominent containers, not every card.
    borderRadius: parseInt(mobileTokens.radius.lg, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
  },
  padded: {
    padding: parseInt(mobileTokens.space.lg, 10),
  },
  baseVariant: {
    backgroundColor: mobileTokens.surface.base,
    borderColor: mobileTokens.border.subtle,
  },
  raised: {
    // E1 — Rule EL-01: elevation is surface lightness + a hairline border, never shadow.
    backgroundColor: mobileTokens.surface.raised,
    borderColor: mobileTokens.border.subtle,
  },
  sunken: {
    backgroundColor: mobileTokens.surface.sunken,
    borderWidth: 0,
  },
  overlay: {
    // E3 — the one elevation level permitted a shadow (Rule EL-01/EL-02),
    // because it must read as detached from a scrolling surface behind it.
    backgroundColor: mobileTokens.surface.overlay,
    borderColor: mobileTokens.border.default,
    shadowColor: mobileTokens.shadow.overlay.color,
    shadowOffset: { width: 0, height: mobileTokens.shadow.overlay.offsetY },
    shadowOpacity: mobileTokens.shadow.overlay.opacity,
    shadowRadius: mobileTokens.shadow.overlay.radius,
    elevation: mobileTokens.shadow.overlay.elevation,
  }
});

