import { useRouter } from "expo-router";
import { useState } from "react";
import type { ReactElement } from "react";
import { View, StyleSheet } from "react-native";

import { useOnboardingDraft } from "../../src/onboarding/OnboardingContext";
import { Button, Text, Screen } from "@avora/ui-mobile/primitives";
import { SelectableCard, StepProgress, InitialsToken } from "@avora/ui-mobile/domain-components";
import { mobileTokens } from "@avora/ui-mobile/tokens";

const TOTAL_STEP_COUNT = 6;
const CURRENT_STEP_NUMBER = 3;
const TILE_FLEX_BASIS = "47%";

// UI-only static list data for the tile picker (FR-011) — matches the
// reference's BRANCHES set. The student's actual branch is whatever they
// select or leave unset via "Skip for now".
const BRANCHES: readonly Readonly<{ id: string; label: string; short: string; hint: string }>[] = [
  { id: "cs", label: "Computer Science", short: "CS", hint: "Core computing" },
  { id: "cse", label: "CSE", short: "CSE", hint: "Computer science & engineering" },
  { id: "cse-ai", label: "CSE-AI", short: "AI", hint: "Artificial intelligence" },
  { id: "cse-ds", label: "CSE-DS", short: "DS", hint: "Data science" },
  { id: "it", label: "IT", short: "IT", hint: "Information technology" },
  { id: "ece", label: "ECE", short: "ECE", hint: "Electronics & communication" },
  { id: "eee", label: "EEE", short: "EEE", hint: "Electrical & electronics" },
  { id: "mech", label: "Mechanical", short: "ME", hint: "Mechanical engineering" },
  { id: "civil", label: "Civil", short: "CE", hint: "Civil engineering" },
  { id: "mba", label: "MBA", short: "MBA", hint: "Business administration" },
];

export default function OnboardingBranchRoute(): ReactElement {
  const router = useRouter();
  const { draft, updateDraft } = useOnboardingDraft();
  const [selectedLabel, setSelectedLabel] = useState<string | null>(draft.branchName);

  function next(): void {
    updateDraft({ branchName: selectedLabel });
    router.push("/(onboarding)/term");
  }

  function skip(): void {
    updateDraft({ branchName: null });
    router.push("/(onboarding)/term");
  }

  return (
    <Screen scroll>
      <StepProgress
        currentStepNumber={CURRENT_STEP_NUMBER}
        totalStepCount={TOTAL_STEP_COUNT}
        onBack={() => router.back()}
      />

      <View style={styles.header}>
        <Text variant="eyebrow" color="accent">Your branch</Text>
        <Text variant="titleLg" color="primary" style={styles.title}>What are you studying?</Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          Pick the branch printed on your syllabus.
        </Text>
      </View>

      <View style={styles.grid}>
        {BRANCHES.map((branch) => {
          const selected = selectedLabel === branch.label;

          return (
            <View key={branch.id} style={styles.tile}>
              <SelectableCard
                title={branch.label}
                subtitle={branch.hint}
                selected={selected}
                layout="tile"
                leading={<InitialsToken label={branch.short} active={selected} />}
                onPress={() => setSelectedLabel(selected ? null : branch.label)}
              />
            </View>
          );
        })}
      </View>

      <View style={styles.actions}>
        <Button
          title="Continue"
          intent="primary"
          size="lg"
          state={selectedLabel === null ? "disabled" : "default"}
          onPress={next}
        />
        <Button
          title="Skip for now"
          intent="neutral"
          size="md"
          onPress={skip}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: parseInt(mobileTokens.space.lg, 10),
    marginBottom: parseInt(mobileTokens.space.lg, 10),
  },
  title: {
    marginTop: parseInt(mobileTokens.space.sm, 10),
  },
  subtitle: {
    marginTop: parseInt(mobileTokens.space.md, 10),
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: parseInt(mobileTokens.space.sm, 10),
  },
  tile: {
    flexBasis: TILE_FLEX_BASIS,
    flexGrow: 1,
  },
  actions: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
    gap: parseInt(mobileTokens.space.sm, 10),
  },
});
