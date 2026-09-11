import { Stack } from "expo-router";
import type { ReactElement } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { mobileTokens } from "@avora/ui-mobile/tokens";

export default function RootLayout(): ReactElement {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          // Native-stack paints its own screen background before a route's
          // own content mounts, and during push/pop transitions. Left
          // unset, that background is the platform default (white) — the
          // most likely source of a white flash between screens.
          contentStyle: { backgroundColor: mobileTokens.surface.base },
        }}
      />
    </SafeAreaProvider>
  );
}
