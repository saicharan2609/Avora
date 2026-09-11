import { useRouter } from "expo-router";
import { useState } from "react";
import type { ReactElement } from "react";
import { ScrollView, View, StyleSheet } from "react-native";

import { getAcademicClient } from "../../src/composition";
import { useAccessToken } from "../../src/auth/useAccessToken";
import { useOnboardingDraft } from "../../src/onboarding/OnboardingContext";
import { Button, Text, Screen } from "@avora/ui-mobile/primitives";
import { SelectableChip, StepProgress } from "@avora/ui-mobile/domain-components";
import { mobileTokens } from "@avora/ui-mobile/tokens";

const TOTAL_STEP_COUNT = 6;
const CURRENT_STEP_NUMBER = 4;

// A year has exactly two semesters; the student only ever picks from these
// two — the resulting academic semester number (1-8) is derived, never
// picked directly, since a flat 1-8 list would ask the student to already
// know the number this screen exists to compute for them.
const YEAR_NUMBERS: readonly number[] = [1, 2, 3, 4];
const SEMESTERS_WITHIN_YEAR: readonly number[] = [1, 2];

function yearChipLabel(yearNumber: number): string {
  return `Year ${yearNumber}`;
}

function semesterChipLabel(semesterWithinYear: number): string {
  return `Semester ${semesterWithinYear}`;
}

// Year 1/Sem 1 → 1, Year 1/Sem 2 → 2, Year 2/Sem 1 → 3, ... Year 4/Sem 2 → 8.
function resolveAcademicSemesterNumber(yearNumber: number, semesterWithinYear: number): number {
  return (yearNumber - 1) * SEMESTERS_WITHIN_YEAR.length + semesterWithinYear;
}

export default function OnboardingTermRoute(): ReactElement {
  const router = useRouter();
  const { accessToken, isLoading: isLoadingToken } = useAccessToken();
  const { draft, updateDraft } = useOnboardingDraft();

  const [currentYearNumber, setCurrentYearNumber] = useState<number | null>(draft.currentYearNumber);
  const [semesterWithinYearNumber, setSemesterWithinYearNumber] = useState<number | null>(
    draft.semesterWithinYearNumber,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = currentYearNumber !== null && semesterWithinYearNumber !== null;

  async function next(): Promise<void> {
    if (currentYearNumber === null || semesterWithinYearNumber === null) {
      return;
    }

    if (accessToken === null) {
      setErrorMessage("You're signed out. Go back and sign in again to continue.");
      return;
    }

    const academicSemesterNumber = resolveAcademicSemesterNumber(currentYearNumber, semesterWithinYearNumber);
    const label = `Semester ${academicSemesterNumber}`;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await getAcademicClient(accessToken).createAcademicTerm({
        label,
        institutionName: draft.institutionName,
        programmeName: draft.programmeName,
        branchName: draft.branchName,
        startsOn: null,
        endsOn: null,
      });

      updateDraft({
        currentYearNumber,
        semesterWithinYearNumber,
        termLabel: label,
        termId: response.term.termId,
      });
      router.push("/(onboarding)/subjects");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save your term.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen scroll>
      <StepProgress
        currentStepNumber={CURRENT_STEP_NUMBER}
        totalStepCount={TOTAL_STEP_COUNT}
        onBack={() => router.back()}
      />

      <View style={styles.header}>
        <Text variant="eyebrow" color="accent">Where you are</Text>
        <Text variant="titleLg" color="primary" style={styles.title}>Tell us about your semester.</Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          This organizes your subjects and resources.
        </Text>
      </View>

      <View style={styles.chipSections}>
        <ChipRow
          label="Current Year"
          options={YEAR_NUMBERS}
          getLabel={yearChipLabel}
          value={currentYearNumber}
          onSelect={(next) => setCurrentYearNumber(currentYearNumber === next ? null : next)}
        />
        <ChipRow
          label="Semester"
          options={SEMESTERS_WITHIN_YEAR}
          getLabel={semesterChipLabel}
          value={semesterWithinYearNumber}
          onSelect={(next) => setSemesterWithinYearNumber(semesterWithinYearNumber === next ? null : next)}
        />
      </View>

      {errorMessage !== null ? (
        <Text variant="caption" color="secondary" style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      <View style={styles.actions}>
        <Button
          title="Continue"
          intent="primary"
          size="lg"
          state={isSubmitting || isLoadingToken ? "loading" : canSubmit ? "default" : "disabled"}
          onPress={() => void next()}
        />
      </View>
    </Screen>
  );
}

function ChipRow({
  label,
  options,
  getLabel,
  value,
  onSelect,
}: Readonly<{
  label: string;
  options: readonly number[];
  getLabel: (option: number) => string;
  value: number | null;
  onSelect: (value: number) => void;
}>): ReactElement {
  return (
    <View style={styles.chipSection}>
      <Text variant="label" color="secondary" style={styles.chipSectionLabel}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {options.map((option) => (
          <SelectableChip
            key={option}
            label={getLabel(option)}
            selected={value === option}
            onPress={() => onSelect(option)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: parseInt(mobileTokens.space.lg, 10),
    marginBottom: parseInt(mobileTokens.space.xl, 10),
  },
  title: {
    marginTop: parseInt(mobileTokens.space.sm, 10),
  },
  subtitle: {
    marginTop: parseInt(mobileTokens.space.md, 10),
  },
  chipSections: {
    gap: parseInt(mobileTokens.space.lg, 10),
  },
  chipSection: {
    gap: parseInt(mobileTokens.space.sm, 10),
  },
  chipSectionLabel: {
    marginBottom: parseInt(mobileTokens.space.xs, 10),
  },
  chipRow: {
    gap: parseInt(mobileTokens.space.sm, 10),
    paddingRight: parseInt(mobileTokens.space.md, 10),
  },
  errorText: {
    color: mobileTokens.feedback.danger.fg,
    marginTop: parseInt(mobileTokens.space.md, 10),
  },
  actions: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
  },
});
