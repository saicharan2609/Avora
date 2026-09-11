import React, { type ReactElement, type ReactNode } from "react";
import { Pressable, Text, StyleSheet, type PressableProps, ActivityIndicator, type ColorValue, type TextStyle, type ViewStyle } from "react-native";

import { mobileTokens } from "../tokens/index";
import type { PrimitiveIntent } from "./PrimitiveIntent.contract";
import type { PrimitiveState } from "./PrimitiveState.contract";

type ButtonSize = "sm" | "md" | "lg" | "xl";
type ButtonIconPosition = "leading" | "trailing";

type ButtonProps = PressableProps & {
  title: string;
  intent?: PrimitiveIntent;
  state?: PrimitiveState;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: ButtonIconPosition;
};

// docs/DESIGN-SYSTEM.md §20.2 — four control heights: sm/md/lg/xl.
const SIZE_HEIGHT: Record<ButtonSize, number> = {
  sm: parseInt(mobileTokens.control.sm, 10),
  md: parseInt(mobileTokens.control.md, 10),
  lg: parseInt(mobileTokens.control.lg, 10),
  xl: parseInt(mobileTokens.control.xl, 10),
};

// Rule SZ-01 — every control keeps a 44 dp hit area even when its visual
// height is smaller, via an invisible hit-slop rather than a taller box.
const TOUCH_TARGET = parseInt(mobileTokens.layout.touchTarget, 10);
const SIZE_HIT_SLOP: Record<ButtonSize, number> = {
  sm: Math.max(0, (TOUCH_TARGET - SIZE_HEIGHT.sm) / 2),
  md: Math.max(0, (TOUCH_TARGET - SIZE_HEIGHT.md) / 2),
  lg: Math.max(0, (TOUCH_TARGET - SIZE_HEIGHT.lg) / 2),
  xl: 0,
};

const SIZE_PADDING_H: Record<ButtonSize, number> = {
  sm: parseInt(mobileTokens.space.sm, 10) * 1.5,
  md: parseInt(mobileTokens.space.md, 10),
  lg: parseInt(mobileTokens.space.lg, 10) - parseInt(mobileTokens.space.xs, 10),
  xl: parseInt(mobileTokens.space.lg, 10),
};

// docs/DESIGN-SYSTEM.md §20.1 — three real visual weights. Any other
// PrimitiveIntent value (success/warning/danger/info) renders as neutral;
// Button doesn't yet have a semantic-feedback variant of its own.
type ButtonVariant = "primary" | "tertiary" | "neutral";

function resolveVariant(intent: PrimitiveIntent): ButtonVariant {
  if (intent === "primary" || intent === "tertiary") {
    return intent;
  }

  return "neutral";
}

// A named constant rather than the literal inline keeps this a plain
// identifier reference in the style objects below, matching this
// codebase's "structural reset, not a themeable colour" treatment (compare
// `borderWidth: 0` elsewhere) — "transparent" has no hex/opacity value a
// design token could hold.
const TRANSPARENT: ColorValue = "transparent";

// Reproduces the reference's `active:scale-[0.985]` press feedback — a
// structural interaction constant, not a themeable design value (same
// precedent as AvoraMark's stroke-width ratio).
const PRESSED_SCALE = 0.985;

const CONTAINER_STYLE: Record<ButtonVariant, ViewStyle> = {
  // The accent glow is a deliberate, scoped exception to Rule EL-01
  // (docs/DESIGN-SYSTEM.md §16.1) — see shadow.accentGlow's own comment.
  primary: {
    backgroundColor: mobileTokens.accent.default,
    shadowColor: mobileTokens.shadow.accentGlow.color,
    shadowOffset: { width: 0, height: mobileTokens.shadow.accentGlow.offsetY },
    shadowOpacity: mobileTokens.shadow.accentGlow.opacity,
    shadowRadius: mobileTokens.shadow.accentGlow.radius,
    elevation: mobileTokens.shadow.accentGlow.elevation,
  },
  neutral: {
    backgroundColor: mobileTokens.surface.raised,
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: mobileTokens.border.default,
  },
  // Transparent, no border — navigation-like actions (Cancel, Skip, Change
  // email), never a second visually-competing action next to a primary.
  tertiary: { backgroundColor: TRANSPARENT },
};

const TEXT_COLOR_STYLE: Record<ButtonVariant, TextStyle> = {
  primary: { color: mobileTokens.surface.base },
  neutral: { color: mobileTokens.text.primary },
  tertiary: { color: mobileTokens.text.secondary },
};

const SPINNER_COLOR: Record<ButtonVariant, ColorValue> = {
  primary: mobileTokens.surface.inverse,
  neutral: mobileTokens.text.primary,
  tertiary: mobileTokens.text.secondary,
};

function ButtonContent({ title, icon, iconPosition, variant, isLoading }: {
  title: string;
  icon: ReactNode;
  iconPosition: ButtonIconPosition;
  variant: ButtonVariant;
  isLoading: boolean;
}): ReactElement {
  if (isLoading) {
    return <ActivityIndicator color={SPINNER_COLOR[variant]} />;
  }

  return (
    <>
      {icon && iconPosition === "leading" ? icon : null}
      <Text style={[styles.textBase, TEXT_COLOR_STYLE[variant]]}>{title}</Text>
      {icon && iconPosition === "trailing" ? icon : null}
    </>
  );
}

export function Button({ title, intent = "primary", state = "default", size = "md", icon, iconPosition = "trailing", style, ...props }: ButtonProps): ReactElement {
  const variant = resolveVariant(intent);
  const isDisabled = state === "disabled" || state === "loading";
  const isLoading = state === "loading";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      hitSlop={SIZE_HIT_SLOP[size]}
      style={({ pressed }) => [
        styles.base,
        { height: SIZE_HEIGHT[size], paddingHorizontal: SIZE_PADDING_H[size] },
        CONTAINER_STYLE[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        typeof style === "function" ? style({ pressed }) : style,
      ]}
      disabled={isDisabled}
      {...props}
    >
      <ButtonContent title={title} icon={icon} iconPosition={iconPosition} variant={variant} isLoading={isLoading} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: parseInt(mobileTokens.radius.xl, 10),
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: parseInt(mobileTokens.space.sm, 10),
  },
  pressed: {
    opacity: parseFloat(mobileTokens.state.mutedOpacity),
    transform: [{ scale: PRESSED_SCALE }],
  },
  disabled: {
    opacity: parseFloat(mobileTokens.state.disabledOpacity),
  },
  textBase: {
    fontSize: parseInt(mobileTokens.type.titleSm.size, 10),
    lineHeight: parseInt(mobileTokens.type.titleSm.lineHeight, 10),
    letterSpacing: parseFloat(mobileTokens.type.titleSm.letterSpacing),
    fontWeight: mobileTokens.type.titleSm.weight as "600",
  },
});
