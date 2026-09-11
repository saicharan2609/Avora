import React, { type ReactElement, type ReactNode } from "react";
import { Text as RNText, StyleSheet, type TextProps } from "react-native";
import { mobileTokens } from "../tokens/index";

type TypographyVariant =
  | "eyebrow"
  | "caption"
  | "label"
  | "body"
  | "bodyLg"
  | "titleSm"
  | "titleMd"
  | "titleLg"
  | "display"
  | "figureSm"
  | "figure"
  | "figureXl";
type TypographyColor = "primary" | "secondary" | "tertiary" | "disabled" | "inverse" | "accent";
type TypographyFontFamily = "sans" | "mono";

type TypographyProps = TextProps & {
  children: ReactNode;
  variant?: TypographyVariant;
  color?: TypographyColor;
  // "mono" reproduces the reference's monospace treatment for step counters,
  // stat figures and code-like identifiers (subject codes) — never for prose
  // (docs/DESIGN-SYSTEM.md TY-02 still governs body/heading text).
  fontFamily?: TypographyFontFamily;
};

// Rule TY-03 (docs/DESIGN-SYSTEM.md §13.2): the eyebrow is the only uppercase role.
const UPPERCASE_VARIANTS: ReadonlySet<TypographyVariant> = new Set(["eyebrow"]);

export function Text({ children, variant = "body", color = "primary", fontFamily = "sans", style, ...props }: TypographyProps): ReactElement {
  return (
    <RNText
      style={[
        styles[variant],
        styles[color],
        UPPERCASE_VARIANTS.has(variant) && styles.uppercase,
        fontFamily === "mono" && styles.mono,
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

function variantStyle(role: Exclude<keyof typeof mobileTokens.type, "family">, weight: "400" | "500" | "600" | "700") {
  const token = mobileTokens.type[role];

  return {
    fontSize: parseInt(token.size, 10),
    lineHeight: parseInt(token.lineHeight, 10),
    letterSpacing: parseFloat(token.letterSpacing),
    fontWeight: weight,
  };
}

const styles = StyleSheet.create({
  eyebrow: variantStyle("eyebrow", "600"),
  caption: variantStyle("caption", "400"),
  label: variantStyle("label", "500"),
  body: variantStyle("body", "400"),
  bodyLg: variantStyle("bodyLg", "400"),
  titleSm: variantStyle("titleSm", "600"),
  titleMd: variantStyle("titleMd", "600"),
  titleLg: variantStyle("titleLg", "700"),
  display: variantStyle("display", "700"),
  figureSm: variantStyle("figureSm", "600"),
  figure: variantStyle("figure", "700"),
  figureXl: variantStyle("figureXl", "700"),
  uppercase: {
    textTransform: "uppercase",
  },
  mono: {
    fontFamily: mobileTokens.type.family.mono,
  },
  primary: {
    color: mobileTokens.text.primary,
  },
  secondary: {
    color: mobileTokens.text.secondary,
  },
  tertiary: {
    color: mobileTokens.text.tertiary,
  },
  disabled: {
    color: mobileTokens.text.disabled,
  },
  inverse: {
    color: mobileTokens.text.inverse,
  },
  accent: {
    color: mobileTokens.accent.strong,
  },
});
