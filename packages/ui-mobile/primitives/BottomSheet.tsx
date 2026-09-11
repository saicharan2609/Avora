import React, { useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import { Animated, Easing, Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { mobileTokens } from "../tokens/index";

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

// Rule M-02 (docs/DESIGN-SYSTEM.md §17): exits are faster than entrances.
const ENTER_DURATION_MS = parseInt(mobileTokens.motion.slow, 10);
const EXIT_DURATION_MS = parseInt(mobileTokens.motion.normal, 10);
const STANDARD_EASING = Easing.bezier(0.2, 0, 0, 1);
// Large enough to guarantee the panel starts fully off-screen regardless of
// device height or the panel's own content height.
const OFFSCREEN_TRANSLATE_DP = 800;
const BACKDROP_MAX_OPACITY = 0.7;

/**
 * A bottom sheet with its own independently-animated backdrop fade and
 * panel slide (reproducing the reference's `.avora-sheet`/`.avora-fade`
 * pair), replacing RN Modal's built-in slide-only transition. The sheet
 * body itself is never glass — docs/DESIGN-SYSTEM.md §16.2 permits glass
 * only on a sheet's drag-handle grabber, not its content — so it reads as
 * detached via the same overlay shadow Card's "overlay" variant uses.
 */
export function BottomSheet({ visible, onClose, children }: BottomSheetProps): ReactElement | null {
  const insets = useSafeAreaInsets();
  const progress = useRef(new Animated.Value(0)).current;
  const [isMounted, setIsMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: ENTER_DURATION_MS,
        easing: STANDARD_EASING,
        useNativeDriver: true,
      }).start();

      return;
    }

    Animated.timing(progress, {
      toValue: 0,
      duration: EXIT_DURATION_MS,
      easing: STANDARD_EASING,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsMounted(false);
      }
    });
  }, [visible, progress]);

  if (!isMounted) {
    return null;
  }

  const panelTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [OFFSCREEN_TRANSLATE_DP, 0],
  });
  const backdropOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, BACKDROP_MAX_OPACITY],
  });

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable
            style={styles.backdropTouchable}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          />
        </Animated.View>

        <Animated.View
          style={[styles.panel, { paddingBottom: insets.bottom + parseInt(mobileTokens.space.md, 10) }, { transform: [{ translateY: panelTranslateY }] }]}
        >
          <View style={styles.grabber} />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: mobileTokens.shadow.overlay.color,
  },
  backdropTouchable: {
    flex: 1,
  },
  panel: {
    backgroundColor: mobileTokens.surface.overlay,
    borderTopLeftRadius: parseInt(mobileTokens.radius.xl, 10),
    borderTopRightRadius: parseInt(mobileTokens.radius.xl, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: mobileTokens.border.default,
    borderBottomWidth: 0,
    paddingTop: parseInt(mobileTokens.space.sm, 10),
    paddingHorizontal: parseInt(mobileTokens.space.lg, 10),
    shadowColor: mobileTokens.shadow.overlay.color,
    shadowOffset: { width: 0, height: -mobileTokens.shadow.overlay.offsetY },
    shadowOpacity: mobileTokens.shadow.overlay.opacity,
    shadowRadius: mobileTokens.shadow.overlay.radius,
    elevation: mobileTokens.shadow.overlay.elevation,
  },
  grabber: {
    alignSelf: "center",
    width: parseInt(mobileTokens.space.xl, 10),
    height: parseInt(mobileTokens.layout.divider, 10) * 4,
    borderRadius: parseInt(mobileTokens.radius.full, 10),
    backgroundColor: mobileTokens.border.strong,
    marginBottom: parseInt(mobileTokens.space.md, 10),
  },
});
