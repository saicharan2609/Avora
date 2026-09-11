import React, { type ReactElement, type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuroraBackdrop } from "./AuroraBackdrop";
import { mobileTokens } from "../tokens/index";

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  glow?: boolean;
  // "aurora" (default) is the dashboard-style top-band wash; "hero" is the
  // auth/welcome two-blob glow — see AuroraBackdrop's own doc comment.
  glowVariant?: "aurora" | "hero";
  avoidsKeyboard?: boolean;
  // Rendered above the scrolling content, carrying the safe-area top inset
  // itself — for a screen whose reference counterpart has a sticky header
  // rather than one that scrolls away with the rest of the page.
  header?: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

/**
 * The shared full-bleed canvas every Avora surface renders inside: dark base
 * background under the status bar/home indicator (docs/DESIGN-SYSTEM.md §9.3,
 * Rule L-03), safe-area-aware content padding, and an optional restrained
 * ambient glow (UI-REFERENCE-DIRECTION.md §4) reserved for entry/hero moments.
 */
function ScreenContent({ scroll, topPadding, bottomInset, contentContainerStyle, children }: {
  scroll: boolean;
  topPadding: number;
  bottomInset: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
}): ReactElement {
  if (scroll) {
    return (
      <ScrollView
        style={styles.flexFill}
        contentContainerStyle={[
          { paddingTop: topPadding, paddingBottom: bottomInset + BOTTOM_SCROLL_BUFFER },
          styles.horizontalPadding,
          contentContainerStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View
      style={[
        styles.flexFill,
        styles.horizontalPadding,
        { paddingTop: topPadding, paddingBottom: bottomInset + PAGE_MARGIN },
        contentContainerStyle,
      ]}
    >
      {children}
    </View>
  );
}

export function Screen({ children, scroll = false, glow = false, glowVariant = "aurora", avoidsKeyboard = true, header, style, contentContainerStyle }: ScreenProps): ReactElement {
  const insets = useSafeAreaInsets();
  // When a sticky header is supplied, it carries the top safe-area inset —
  // the scroll/content area below it only needs the page margin.
  const contentTopPadding = header ? PAGE_MARGIN : insets.top + PAGE_MARGIN;

  const content = (
    <ScreenContent scroll={scroll} topPadding={contentTopPadding} bottomInset={insets.bottom} contentContainerStyle={contentContainerStyle}>
      {children}
    </ScreenContent>
  );

  return (
    <View style={[styles.base, style]}>
      <StatusBar barStyle="light-content" />
      {glow ? <AuroraBackdrop variant={glowVariant} /> : null}
      {header ? (
        <View style={[styles.horizontalPadding, { paddingTop: insets.top }]}>{header}</View>
      ) : null}
      {avoidsKeyboard ? (
        <KeyboardAvoidingView
          style={styles.flexFill}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </View>
  );
}

const PAGE_MARGIN = parseInt(mobileTokens.space.md, 10);
const BOTTOM_SCROLL_BUFFER = parseInt(mobileTokens.space.xxl, 10);

const styles = StyleSheet.create({
  base: {
    flex: 1,
    backgroundColor: mobileTokens.surface.base,
    overflow: "hidden",
  },
  flexFill: {
    flex: 1,
  },
  horizontalPadding: {
    paddingHorizontal: PAGE_MARGIN,
  },
});
