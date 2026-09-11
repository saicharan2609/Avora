import { Stack } from "expo-router";
import type { ReactElement } from "react";

import { OnboardingProvider } from "../../src/onboarding/OnboardingContext";

export default function OnboardingLayout(): ReactElement {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </OnboardingProvider>
  );
}
