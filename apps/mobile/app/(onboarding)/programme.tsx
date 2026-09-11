import { useRouter } from "expo-router";
import { useState } from "react";
import type { ReactElement } from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { Plus } from "lucide-react-native";

import { useOnboardingDraft } from "../../src/onboarding/OnboardingContext";
import { Button, Text, Input, Screen } from "@avora/ui-mobile/primitives";
import { SelectableCard, StepProgress, InitialsToken } from "@avora/ui-mobile/domain-components";
import { mobileTokens } from "@avora/ui-mobile/tokens";

const TOTAL_STEP_COUNT = 6;
const CURRENT_STEP_NUMBER = 2;
const PLUS_ICON_SIZE_DP = 16;

// UI-only static list data for the selection-first picker (FR-011) — the
// student's actual programme is whatever they select or type manually.
const SEED_PROGRAMMES: readonly Readonly<{ id: string; name: string; short: string; hint: string }>[] = [
  { id: "btech", name: "B.Tech", short: "BT", hint: "Bachelor of Technology" },
  { id: "be", name: "B.E.", short: "BE", hint: "Bachelor of Engineering" },
  { id: "bca", name: "BCA", short: "BCA", hint: "Bachelor of Computer Applications" },
  { id: "mca", name: "MCA", short: "MCA", hint: "Master of Computer Applications" },
  { id: "mtech", name: "M.Tech", short: "MT", hint: "Master of Technology" },
  { id: "mba", name: "MBA", short: "MBA", hint: "Master of Business Administration" },
  { id: "bsc", name: "B.Sc", short: "BSC", hint: "Bachelor of Science" },
  { id: "ba", name: "B.A.", short: "BA", hint: "Bachelor of Arts" },
];

export default function OnboardingProgrammeRoute(): ReactElement {
  const router = useRouter();
  const { draft, updateDraft } = useOnboardingDraft();

  const [selectedName, setSelectedName] = useState<string | null>(draft.programmeName);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [manualName, setManualName] = useState("");

  const manualSelection =
    selectedName !== null && !SEED_PROGRAMMES.some((programme) => programme.name === selectedName)
      ? selectedName
      : null;

  function selectSeedProgramme(name: string): void {
    setSelectedName((current) => (current === name ? null : name));
  }

  function saveManualProgramme(): void {
    const name = manualName.trim();

    if (name.length === 0) {
      return;
    }

    setSelectedName(name);
    setIsManualOpen(false);
    setManualName("");
  }

  function next(): void {
    updateDraft({ programmeName: selectedName });
    router.push("/(onboarding)/branch");
  }

  function skip(): void {
    updateDraft({ programmeName: null });
    router.push("/(onboarding)/branch");
  }

  return (
    <Screen scroll>
      <StepProgress
        currentStepNumber={CURRENT_STEP_NUMBER}
        totalStepCount={TOTAL_STEP_COUNT}
        onBack={() => router.back()}
      />

      <View style={styles.header}>
        <Text variant="eyebrow" color="accent">Your programme</Text>
        <Text variant="titleLg" color="primary" style={styles.title}>What's your programme?</Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          Pick the degree printed on your admission letter.
        </Text>
      </View>

      <View style={styles.list}>
        {manualSelection !== null ? (
          <SelectableCard
            title={manualSelection}
            subtitle="Added by you"
            selected
            layout="row"
            leading={<InitialsToken label={manualSelection.slice(0, 2).toUpperCase()} active />}
            trailingLabel="Added by you"
            onPress={() => setSelectedName(manualSelection)}
          />
        ) : null}

        {SEED_PROGRAMMES.map((programme) => (
          <SelectableCard
            key={programme.id}
            title={programme.name}
            subtitle={programme.hint}
            selected={selectedName === programme.name}
            layout="row"
            leading={<InitialsToken label={programme.short} active={selectedName === programme.name} />}
            onPress={() => selectSeedProgramme(programme.name)}
          />
        ))}
      </View>

      {isManualOpen ? (
        <View style={styles.manualPanel}>
          <Text variant="eyebrow" color="tertiary">Add your programme</Text>
          <Input
            value={manualName}
            onChangeText={setManualName}
            placeholder="e.g. B.Voc"
            autoCapitalize="words"
            style={styles.manualInput}
          />
          <View style={styles.manualActions}>
            <Button
              title="Save programme"
              intent="primary"
              size="md"
              state={manualName.trim().length === 0 ? "disabled" : "default"}
              onPress={saveManualProgramme}
              style={styles.manualSaveButton}
            />
            <Button
              title="Cancel"
              intent="neutral"
              size="md"
              onPress={() => {
                setIsManualOpen(false);
                setManualName("");
              }}
            />
          </View>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() => setIsManualOpen(true)}
          style={({ pressed }) => [styles.manualToggle, pressed && styles.manualTogglePressed]}
        >
          <Plus size={PLUS_ICON_SIZE_DP} color={mobileTokens.text.secondary} />
          <Text variant="label" color="secondary">Add programme manually</Text>
        </Pressable>
      )}

      <View style={styles.actions}>
        <Button
          title="Continue"
          intent="primary"
          size="lg"
          state={selectedName === null ? "disabled" : "default"}
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
  list: {
    gap: parseInt(mobileTokens.space.sm, 10),
  },
  manualPanel: {
    marginTop: parseInt(mobileTokens.space.md, 10),
    borderRadius: parseInt(mobileTokens.radius.lg, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: mobileTokens.border.subtle,
    backgroundColor: mobileTokens.surface.raised,
    padding: parseInt(mobileTokens.space.md, 10),
  },
  manualInput: {
    marginTop: parseInt(mobileTokens.space.sm, 10),
  },
  manualActions: {
    flexDirection: "row",
    gap: parseInt(mobileTokens.space.sm, 10),
    marginTop: parseInt(mobileTokens.space.md, 10),
  },
  manualSaveButton: {
    flex: 1,
  },
  manualToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: parseInt(mobileTokens.space.sm, 10),
    marginTop: parseInt(mobileTokens.space.md, 10),
    height: parseInt(mobileTokens.layout.touchTarget, 10),
    borderRadius: parseInt(mobileTokens.radius.lg, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: mobileTokens.border.subtle,
    borderStyle: "dashed",
  },
  manualTogglePressed: {
    opacity: parseFloat(mobileTokens.state.mutedOpacity),
  },
  actions: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
    gap: parseInt(mobileTokens.space.sm, 10),
  },
});
