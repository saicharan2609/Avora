import { useRouter } from "expo-router";
import { useState } from "react";
import type { ReactElement } from "react";
import { FlatList, View, StyleSheet } from "react-native";

import { getAcademicClient } from "../../src/composition";
import { useAccessToken } from "../../src/auth/useAccessToken";
import { useOnboardingDraft, type OnboardingDraftSubject } from "../../src/onboarding/OnboardingContext";
import { Button, Text, Input, Screen } from "@avora/ui-mobile/primitives";
import { InitialsToken, StepProgress } from "@avora/ui-mobile/domain-components";
import { mobileTokens } from "@avora/ui-mobile/tokens";

const TOTAL_STEP_COUNT = 6;
const CURRENT_STEP_NUMBER = 5;

function initialsOf(value: string): string {
  const initials = value
    .split(/\s+/)
    .filter((word) => /[a-zA-Z0-9]/.test(word[0] ?? ""))
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return initials.length > 0 ? initials : "··";
}

export default function OnboardingSubjectsRoute(): ReactElement {
  const router = useRouter();
  const { accessToken } = useAccessToken();
  const { draft, updateDraft } = useOnboardingDraft();
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function addSubject(): Promise<void> {
    const displayName = value.trim();

    if (displayName.length === 0 || accessToken === null || draft.termId === null) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await getAcademicClient(accessToken).createSubject({
        termId: draft.termId,
        displayName,
        subjectCode: null,
        description: null,
      });

      updateDraft({
        subjects: [
          ...draft.subjects,
          { subjectId: response.subject.subjectId, displayName: response.subject.displayName },
        ],
      });
      setValue("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not add that subject.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // A subject is created server-side (createSubject, above) the moment it's
  // added, and the academic setup API exposes no update/delete endpoint for
  // a subject that already exists (packages/core/api/academic/contracts.ts
  // has create* and get* only). An in-place rename/delete affordance here
  // would edit local draft state while the server-side row stayed
  // unchanged — a name the student believes they changed, or a subject they
  // believe they removed, silently surviving server-side. Rather than fake
  // that persistence, this list is display-only once a subject is added;
  // reviewing/renaming/removing is deferred to when that API exists.

  return (
    <Screen>
      <StepProgress
        currentStepNumber={CURRENT_STEP_NUMBER}
        totalStepCount={TOTAL_STEP_COUNT}
        onBack={() => router.back()}
      />

      <View style={styles.header}>
        <Text variant="eyebrow" color="accent">Your subjects</Text>
        <Text variant="titleLg" color="primary" style={styles.title}>Which subjects are you taking?</Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          Add them one at a time — Avora organizes notes and revision around each one.
        </Text>
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={draft.subjects}
          keyExtractor={(subject) => subject.subjectId}
          renderItem={({ item }) => <SubjectRow subject={item} />}
          ListEmptyComponent={
            <Text variant="caption" color="tertiary" style={styles.emptyText}>
              No subjects yet. Add your first one below.
            </Text>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <View style={styles.formGroup}>
        {errorMessage !== null ? (
          <Text variant="caption" color="secondary" style={styles.errorText}>{errorMessage}</Text>
        ) : null}
        <View style={styles.addRow}>
          <View style={styles.addInputWrapper}>
            <Input
              value={value}
              onChangeText={setValue}
              placeholder="Add a subject"
              autoCapitalize="words"
            />
          </View>
          <Button
            title="Add"
            intent="primary"
            size="lg"
            state={isSubmitting ? "loading" : value.trim().length === 0 ? "disabled" : "default"}
            onPress={() => void addSubject()}
            style={styles.addButton}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Continue"
          intent="primary"
          size="lg"
          state={draft.subjects.length === 0 ? "disabled" : "default"}
          onPress={() => router.push("/(onboarding)/structure")}
        />
      </View>
    </Screen>
  );
}

function SubjectRow({ subject }: Readonly<{ subject: OnboardingDraftSubject }>): ReactElement {
  return (
    <View style={styles.row}>
      <InitialsToken label={initialsOf(subject.displayName)} />
      <View style={styles.rowLabel}>
        <Text variant="bodyLg" color="primary" numberOfLines={1}>{subject.displayName}</Text>
      </View>
    </View>
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
  listContainer: {
    flex: 1,
  },
  listContent: {
    gap: parseInt(mobileTokens.space.sm, 10),
    paddingBottom: parseInt(mobileTokens.space.md, 10),
  },
  emptyText: {
    borderRadius: parseInt(mobileTokens.radius.lg, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: mobileTokens.border.subtle,
    borderStyle: "dashed",
    paddingVertical: parseInt(mobileTokens.space.xl, 10),
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: parseInt(mobileTokens.space.md, 10),
    borderRadius: parseInt(mobileTokens.radius.lg, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10) * 2,
    borderColor: mobileTokens.border.subtle,
    backgroundColor: mobileTokens.surface.raised,
    padding: parseInt(mobileTokens.space.md, 10),
  },
  rowLabel: {
    flex: 1,
    minWidth: 0,
  },
  formGroup: {
    gap: parseInt(mobileTokens.space.sm, 10),
    marginTop: parseInt(mobileTokens.space.sm, 10),
  },
  errorText: {
    color: mobileTokens.feedback.danger.fg,
  },
  addRow: {
    flexDirection: "row",
    gap: parseInt(mobileTokens.space.sm, 10),
    alignItems: "center",
  },
  addInputWrapper: {
    flex: 1,
  },
  addButton: {
    minWidth: parseInt(mobileTokens.control.lg, 10) * 1.4,
  },
  footer: {
    paddingTop: parseInt(mobileTokens.space.md, 10),
  },
});
