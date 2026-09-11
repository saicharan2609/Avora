import React, { type ReactElement } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { mobileTokens } from "../tokens/index";

type AvoraMarkProps = {
  sizeDp?: number;
};

// Reference glyph geometry (viewBox 0 0 32 32), ported verbatim from the
// canonical mark (reference/prototypes/avora-dashboard/components/auth/avora-mark.tsx):
// a stroked mountain-peak "A" apex plus a half-opacity crossbar, inside a
// squircle tile with a tinted fill and a hairline accent border.
const VIEW_BOX = 32;
const APEX_PATH = "M6 26 16 6l10 20";
const CROSSBAR_PATH = "M11 19h10";
const STROKE_WIDTH = 3.2;
const GLYPH_RATIO = 0.56;
const TILE_CORNER_RATIO = 0.28;

/**
 * The Avora brand mark: a mint mountain-peak "A" rendered as real SVG paths
 * inside a squircle tile, matching the reference's tile+glyph construction
 * (border-primary/25 + bg-primary/12 tint + a 56%-scaled glyph) rather than
 * approximating the letterform with rotated View rectangles.
 */
export function AvoraMark({ sizeDp = 40 }: AvoraMarkProps): ReactElement {
  const glyphSize = sizeDp * GLYPH_RATIO;
  const scale = glyphSize / VIEW_BOX;
  const strokeWidth = STROKE_WIDTH * scale;
  const cornerRadius = sizeDp * TILE_CORNER_RATIO;

  return (
    // Decorative: every current usage pairs the mark with an adjacent
    // "Avora" text node a screen reader already announces.
    <View
      style={[styles.tile, { width: sizeDp, height: sizeDp, borderRadius: cornerRadius }]}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={glyphSize} height={glyphSize} viewBox={`0 0 ${VIEW_BOX} ${VIEW_BOX}`}>
        <Path
          d={APEX_PATH}
          stroke={mobileTokens.accent.default}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d={CROSSBAR_PATH}
          stroke={mobileTokens.accent.default}
          strokeOpacity={0.5}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: `${mobileTokens.accent.default}40`,
    backgroundColor: `${mobileTokens.accent.default}1F`,
    alignItems: "center",
    justifyContent: "center",
  },
});
