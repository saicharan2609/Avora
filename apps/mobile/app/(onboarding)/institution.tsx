import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { Plus, Search } from "lucide-react-native";

import { useOnboardingDraft } from "../../src/onboarding/OnboardingContext";
import { Button, Text, Input, Screen } from "@avora/ui-mobile/primitives";
import { SelectableCard, StepProgress, InitialsToken } from "@avora/ui-mobile/domain-components";
import { mobileTokens } from "@avora/ui-mobile/tokens";

const TOTAL_STEP_COUNT = 6;
const CURRENT_STEP_NUMBER = 1;
const SEARCH_ICON_SIZE_DP = 18;
const PLUS_ICON_SIZE_DP = 16;

// UI-only static list data for the search-first picker (FR-011). This is
// approved reference language, not fabricated academic content — the
// student's actual institution is whatever they select or type manually.
type SeedInstitution = Readonly<{ id: string; name: string; short: string; city: string }>;

const SEED_INSTITUTIONS: readonly SeedInstitution[] = [
  { id: "snist", name: "Sreenidhi Institute of Science and Technology", short: "SNIST", city: "Hyderabad" },
  { id: "vit", name: "Vellore Institute of Technology", short: "VIT", city: "Vellore" },
  { id: "srm", name: "SRM Institute of Science & Technology", short: "SRM", city: "Chennai" },
  { id: "anna", name: "Anna University", short: "AU", city: "Chennai" },
  { id: "bits", name: "Birla Institute of Technology & Science", short: "BITS", city: "Pilani" },
  { id: "dtu", name: "Delhi Technological University", short: "DTU", city: "New Delhi" },
  { id: "nitt", name: "National Institute of Technology", short: "NIT", city: "Tiruchirappalli" },
  { id: "cbit", name: "Chaitanya Bharathi Institute of Technology", short: "CBIT", city: "Hyderabad" },
  { id: "vnr", name: "VNR Vignana Jyothi Institute of Engineering", short: "VNR", city: "Hyderabad" },
  { id: "mvsr", name: "MVSR Engineering College", short: "MVSR", city: "Hyderabad" },
];

function initialsOf(value: string): string {
  const initials = value
    .split(/\s+/)
    .filter((word) => /[a-zA-Z0-9]/.test(word[0] ?? ""))
    .slice(0, 3)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return initials.length > 0 ? initials : "··";
}

export default function OnboardingInstitutionRoute(): ReactElement {
  const router = useRouter();
  const { draft, updateDraft } = useOnboardingDraft();

  const [query, setQuery] = useState("");
  const [selectedName, setSelectedName] = useState<string | null>(draft.institutionName);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [manualName, setManualName] = useState("");

  const trimmedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (trimmedQuery.length === 0) {
      return SEED_INSTITUTIONS;
    }

    return SEED_INSTITUTIONS.filter((institution) =>
      [institution.name, institution.short, institution.city].some((field) =>
        field.toLowerCase().includes(trimmedQuery),
      ),
    );
  }, [trimmedQuery]);

  // A manually added institution isn't part of the seed list, so it's
  // pinned above the results as its own row once selected.
  const manualSelection =
    selectedName !== null && !SEED_INSTITUTIONS.some((institution) => institution.name === selectedName)
      ? selectedName
      : null;

  function selectSeedInstitution(name: string): void {
    setSelectedName((current) => (current === name ? null : name));
  }

  function saveManualInstitution(): void {
    const name = manualName.trim();

    if (name.length === 0) {
      return;
    }

    setSelectedName(name);
    setIsManualOpen(false);
    setManualName("");
    setQuery("");
  }

  function next(): void {
    updateDraft({ institutionName: selectedName });
    router.push("/(onboarding)/programme");
  }

  return (
    <Screen scroll>
      <StepProgress
        currentStepNumber={CURRENT_STEP_NUMBER}
        totalStepCount={TOTAL_STEP_COUNT}
        onBack={() => router.back()}
      />

      <View style={styles.header}>
        <Text variant="eyebrow" color="accent">Your campus</Text>
        <Text variant="titleLg" color="primary" style={styles.title}>
          Which college do you study at?
        </Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          This helps us match your academic calendar and grading pattern.
        </Text>
      </View>

      <View style={styles.searchField}>
        <Search size={SEARCH_ICON_SIZE_DP} color={mobileTokens.text.tertiary} style={styles.searchIcon} />
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Search your college"
          autoCapitalize="words"
          style={styles.searchInput}
        />
      </View>

      <View style={styles.results}>
        <Text variant="eyebrow" color="tertiary">
          {trimmedQuery.length > 0 ? "Search results" : "Popular colleges"}
        </Text>

        <View style={styles.list}>
          {manualSelection !== null ? (
            <SelectableCard
              title={manualSelection}
              subtitle="Added by you"
              selected
              layout="row"
              leading={<InitialsToken label={initialsOf(manualSelection)} active />}
              trailingLabel="Added by you"
              onPress={() => setSelectedName(manualSelection)}
            />
          ) : null}

          {results.map((institution) => (
            <SelectableCard
              key={institution.id}
              title={institution.name}
              subtitle={institution.city}
              selected={selectedName === institution.name}
              layout="row"
              leading={<InitialsToken label={institution.short} active={selectedName === institution.name} />}
              trailingLabel={institution.id === "snist" ? "Suggested" : undefined}
              onPress={() => selectSeedInstitution(institution.name)}
            />
          ))}
        </View>

        {results.length === 0 && manualSelection === null ? (
          <Text variant="caption" color="tertiary" style={styles.emptyText}>
            {`No match for "${query.trim()}". Add it manually below.`}
          </Text>
        ) : null}
      </View>

      {isManualOpen ? (
        <View style={styles.manualPanel}>
          <Text variant="eyebrow" color="tertiary">Add your college</Text>
          <Input
            value={manualName}
            onChangeText={setManualName}
            placeholder="College name"
            autoCapitalize="words"
            style={styles.manualInput}
          />
          <View style={styles.manualActions}>
            <Button
              title="Save college"
              intent="primary"
              size="md"
              state={manualName.trim().length === 0 ? "disabled" : "default"}
              onPress={saveManualInstitution}
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
          <Text variant="label" color="secondary">Add college manually</Text>
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
  searchField: {
    justifyContent: "center",
  },
  searchIcon: {
    position: "absolute",
    left: parseInt(mobileTokens.space.md, 10),
    top: 0,
    bottom: 0,
    marginTop: "auto",
    marginBottom: "auto",
    zIndex: 1,
  },
  searchInput: {
    paddingLeft: parseInt(mobileTokens.space.md, 10) * 2 + SEARCH_ICON_SIZE_DP,
  },
  results: {
    marginTop: parseInt(mobileTokens.space.lg, 10),
  },
  list: {
    marginTop: parseInt(mobileTokens.space.md, 10),
    gap: parseInt(mobileTokens.space.sm, 10),
  },
  emptyText: {
    marginTop: parseInt(mobileTokens.space.md, 10),
    textAlign: "center",
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
