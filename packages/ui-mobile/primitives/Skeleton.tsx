import React, { type ReactElement, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, type ViewProps, type DimensionValue, type LayoutChangeEvent } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { mobileTokens } from "../tokens/index";

type SkeletonProps = ViewProps & {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
};

const SWEEP_DURATION_MS = 1600;
const SWEEP_WIDTH_RATIO = 0.6;

/**
 * A loading placeholder: a static elevated block with a soft light sweep
 * crossing it on a loop, matching the reference's `.skeleton`/`.shimmer`
 * treatment rather than a uniform pulsing-opacity block.
 */
export function Skeleton({ width = "100%", height = parseInt(mobileTokens.type.body.lineHeight, 10), borderRadius = parseInt(mobileTokens.radius.md, 10), style, ...props }: SkeletonProps): ReactElement {
  const [containerWidthDp, setContainerWidthDp] = useState(0);
  const sweepPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (containerWidthDp <= 0) {
      return;
    }

    sweepPosition.setValue(0);

    const loop = Animated.loop(
      Animated.timing(sweepPosition, {
        toValue: 1,
        duration: SWEEP_DURATION_MS,
        useNativeDriver: true,
      }),
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [containerWidthDp, sweepPosition]);

  function handleLayout(event: LayoutChangeEvent): void {
    setContainerWidthDp(event.nativeEvent.layout.width);
  }

  const sweepWidthDp = containerWidthDp * SWEEP_WIDTH_RATIO;
  const translateX = sweepPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [-sweepWidthDp, containerWidthDp],
  });

  return (
    <Animated.View
      onLayout={handleLayout}
      style={[styles.skeleton, { width, height, borderRadius }, style]}
      {...props}
    >
      {containerWidthDp > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.sweep, { width: sweepWidthDp, transform: [{ translateX }] }]}
        >
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id="skeletonSweep" x1="0" y1="0" x2="1" y2="0">
                <Stop offset={0} stopColor={mobileTokens.text.primary} stopOpacity={0} />
                <Stop offset={0.5} stopColor={mobileTokens.text.primary} stopOpacity={0.06} />
                <Stop offset={1} stopColor={mobileTokens.text.primary} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#skeletonSweep)" />
          </Svg>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: mobileTokens.surface.raised,
    overflow: "hidden",
  },
  sweep: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
  },
});
