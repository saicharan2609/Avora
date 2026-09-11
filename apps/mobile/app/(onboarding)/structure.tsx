import { useRouter } from "expo-router";
import { useState } from "react";
import type { ComponentType, ReactElement } from "react";
import { Pressable, ScrollView, View, StyleSheet } from "react-native";
import {
  Ban,
  CalendarRange,
  ClipboardList,
  FlaskConical,
  FolderKanban,
  Layers,
  Minus,
  Network,
  Plus,
  Sparkles,
  SquareCode,
} from "lucide-react-native";

import { getAcademicClient } from "../../src/composition";
import { useAccessToken } from "../../src/auth/useAccessToken";
import { useOnboardingDraft } from "../../src/onboarding/OnboardingContext";
import { Button, Text, Input, Screen } from "@avora/ui-mobile/primitives";
import { SelectableCard, SelectableChip, StepProgress } from "@avora/ui-mobile/domain-components";
import { mobileTokens } from "@avora/ui-mobile/tokens";

const TOTAL_STEP_COUNT = 6;
const CURRENT_STEP_NUMBER = 6;
const STEPPER_ICON_SIZE_DP = 20;
const TILE_FLEX_BASIS = "47%";
const MIN_COUNT = 1;
const MAX_COUNT = 60;
const DEFAULT_SUGGESTED_COUNT = 5;

type StructureTypeOption = Readonly<{
  id: string;
  label: string;
  hint: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  suggestedCount: number;
}>;

const NO_STRUCTURE_OPTION_ID = "none";
const CUSTOM_OPTION_ID = "custom";

// A set of suggestions, never a whitelist (NN-01/FR-014/FR-020) — "Custom"
// with free text always works, and the chosen label only ever becomes the
// title text of student-created structure units, never a schema identifier.
// A textbook-style option is reachable via "Custom" free text rather than as
// a listed suggestion here: the repo-wide NN-01 lint gate (avora/no-fixed-hierarchy)
// blocks that specific word anywhere in source text, including as a UI label.
const STRUCTURE_TYPE_OPTIONS: readonly StructureTypeOption[] = [
  { id: "unit", label: "Unit", hint: "Most theory subjects", icon: Layers, suggestedCount: 5 },
  { id: "module", label: "Module", hint: "Module-based syllabus", icon: Network, suggestedCount: 6 },
  { id: "topic", label: "Topic", hint: "Concept by concept", icon: ClipboardList, suggestedCount: 8 },
  { id: "week", label: "Week", hint: "Weekly plan", icon: CalendarRange, suggestedCount: 15 },
  { id: "experiment", label: "Experiment", hint: "Practical labs", icon: FlaskConical, suggestedCount: 12 },
  { id: "practical", label: "Practical", hint: "Hands-on sessions", icon: FlaskConical, suggestedCount: 12 },
  { id: "lab", label: "Lab", hint: "Lab sessions", icon: FlaskConical, suggestedCount: 12 },
  { id: "project", label: "Project", hint: "Studio or capstone", icon: FolderKanban, suggestedCount: 4 },
  { id: "program", label: "Program", hint: "Coding programs", icon: SquareCode, suggestedCount: 14 },
  { id: CUSTOM_OPTION_ID, label: "Custom", hint: "Name it yourself", icon: Sparkles, suggestedCount: 6 },
];

const CUSTOM_STRUCTURE_EXAMPLES: readonly string[] = ["Topics", "Sections", "Case Studies", "Milestones"];

type SubjectStructureSelection = Readonly<{
  optionId: string | null;
  customLabel: string;
  count: number;
}>;

const EMPTY_SELECTION: SubjectStructureSelection = { optionId: null, customLabel: "", count: 0 };

type StructurePhase = "structure" | "count";

/** Three sensible presets around the suggested value for the chosen structure. */
function quickCounts(suggested: number): readonly number[] {
  const set = new Set([Math.max(MIN_COUNT, suggested - 2), suggested, suggested + 2]);
  return Array.from(set).slice(0, 3);
}

function pluralizeLabel(label: string, count: number): string {
  return `${label.toLowerCase()}${count === 1 ? "" : "s"}`;
}

type StepCopy = Readonly<{ title: string; subtitle: string }>;

function buildStepCopy(phase: StructurePhase, subjectDisplayName: string, resolvedLabelBase: string, count: number): StepCopy {
  if (phase === "structure") {
    return {
      title: `How is ${subjectDisplayName} organized?`,
      subtitle: "Every subject is different — pick whatever your syllabus actually uses.",
    };
  }

  const pluralLabel = pluralizeLabel(resolvedLabelBase, count);

  return {
    title: `How many ${pluralLabel} are there?`,
    subtitle: `An approximate number is fine. You can add or remove ${pluralLabel} later.`,
  };
}

type ContinueButtonState = "loading" | "disabled" | "default";

function resolveContinueButtonState(isSubmitting: boolean, phase: StructurePhase, structureReady: boolean): ContinueButtonState {
  if (isSubmitting) {
    return "loading";
  }

  if (phase === "structure" && !structureReady) {
    return "disabled";
  }

  return "default";
}

function resolveContinueLabel(phase: StructurePhase, isLastSubject: boolean): string {
  if (phase === "count" && isLastSubject) {
    return "Finish setup";
  }

  return "Continue";
}

function findStructureOption(optionId: string | null): StructureTypeOption | null {
  if (optionId === null) {
    return null;
  }

  const found = STRUCTURE_TYPE_OPTIONS.find((option) => option.id === optionId);

  return found === undefined ? null : found;
}

function resolveLabelBase(selection: SubjectStructureSelection, selectedOption: StructureTypeOption | null): string {
  if (selection.optionId === CUSTOM_OPTION_ID) {
    return selection.customLabel.trim();
  }

  if (selectedOption === null) {
    return "";
  }

  return selectedOption.label;
}

function resolveSuggestedCount(selectedOption: StructureTypeOption | null): number {
  if (selectedOption === null) {
    return DEFAULT_SUGGESTED_COUNT;
  }

  return selectedOption.suggestedCount;
}

function resolveCount(selection: SubjectStructureSelection, suggestedCount: number): number {
  if (selection.count > 0) {
    return selection.count;
  }

  return suggestedCount;
}

function resolveStructureReady(
  selection: SubjectStructureSelection,
  isNoStructureSelected: boolean,
  resolvedLabelBase: string,
): boolean {
  if (isNoStructureSelected) {
    return true;
  }

  return selection.optionId !== null && resolvedLabelBase.length > 0;
}

export default function OnboardingStructureRoute(): ReactElement {
  const router = useRouter();
  const { accessToken } = useAccessToken();
  const { draft } = useOnboardingDraft();

  const [subjectIndex, setSubjectIndex] = useState(0);
  const [phase, setPhase] = useState<StructurePhase>("structure");
  const [selectionsBySubjectId, setSelectionsBySubjectId] = useState<Record<string, SubjectStructureSelection>>({});
  const [createdSubjectIds, setCreatedSubjectIds] = useState<ReadonlySet<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subject = draft.subjects[subjectIndex] ?? null;

  if (subject === null) {
    return (
      <Screen>
        <StepProgress
          currentStepNumber={CURRENT_STEP_NUMBER}
          totalStepCount={TOTAL_STEP_COUNT}
          onBack={() => router.back()}
        />
        <View style={styles.header}>
          <Text variant="titleLg" color="primary" style={styles.title}>Add a subject first</Text>
          <Text variant="body" color="secondary" style={styles.subtitle}>
            You'll need at least one subject before organizing its structure.
          </Text>
        </View>
        <View style={styles.actions}>
          <Button
            title="Back to subjects"
            intent="primary"
            size="lg"
            onPress={() => router.push("/(onboarding)/subjects")}
          />
        </View>
      </Screen>
    );
  }

  const subjectId = subject.subjectId;
  const selection = selectionsBySubjectId[subjectId] ?? EMPTY_SELECTION;
  const selectedOption = findStructureOption(selection.optionId);
  const isNoStructureSelected = selection.optionId === NO_STRUCTURE_OPTION_ID;
  const resolvedLabelBase = resolveLabelBase(selection, selectedOption);
  const isLastSubject = subjectIndex === draft.subjects.length - 1;
  const suggestedCount = resolveSuggestedCount(selectedOption);
  const count = resolveCount(selection, suggestedCount);

  function updateSelection(patch: Partial<SubjectStructureSelection>): void {
    setSelectionsBySubjectId((current) => ({
      ...current,
      [subjectId]: { ...(current[subjectId] ?? EMPTY_SELECTION), ...patch },
    }));
  }

  function selectOption(optionId: string): void {
    const nextOptionId = selection.optionId === optionId ? null : optionId;
    updateSelection({ optionId: nextOptionId });
  }

  function advanceToNextSubjectOrFinish(): void {
    if (isLastSubject) {
      router.push("/(onboarding)/completion");
      return;
    }

    setSubjectIndex(subjectIndex + 1);
    setPhase("structure");
  }

  function handleContinueFromStructure(): void {
    if (isNoStructureSelected) {
      advanceToNextSubjectOrFinish();
      return;
    }

    if (selection.count === 0) {
      updateSelection({ count: suggestedCount });
    }

    setPhase("count");
  }

  async function handleContinueFromCount(): Promise<void> {
    if (createdSubjectIds.has(subjectId)) {
      advanceToNextSubjectOrFinish();
      return;
    }

    const termId = draft.termId;

    if (accessToken === null || termId === null || resolvedLabelBase.length === 0) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const client = getAcademicClient(accessToken);

      for (let position = 0; position < count; position += 1) {
        // Sequential by design: sortOrder must reflect creation order.
        await client.createStructureUnit({
          termId,
          subjectId,
          parentUnitId: null,
          title: `${resolvedLabelBase} ${position + 1}`,
          description: null,
          unitKind: "custom",
          source: "student_declared",
          sortOrder: position,
        });
      }

      setCreatedSubjectIds((current) => new Set(current).add(subjectId));
      advanceToNextSubjectOrFinish();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save your structure.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBack(): void {
    if (phase === "count") {
      setPhase("structure");
      return;
    }

    if (subjectIndex > 0) {
      setSubjectIndex(subjectIndex - 1);
      setPhase("count");
      return;
    }

    router.back();
  }

  const structureReady = resolveStructureReady(selection, isNoStructureSelected, resolvedLabelBase);
  const continueLabel = resolveContinueLabel(phase, isLastSubject);
  const stepCopy = buildStepCopy(phase, subject.displayName, resolvedLabelBase, count);

  return (
    <Screen scroll>
      <StepProgress currentStepNumber={CURRENT_STEP_NUMBER} totalStepCount={TOTAL_STEP_COUNT} onBack={handleBack} />

      <View style={styles.header}>
        <Text variant="eyebrow" color="accent">
          {`Subject ${subjectIndex + 1} of ${draft.subjects.length}`}
        </Text>
        <Text variant="titleLg" color="primary" style={styles.title}>{stepCopy.title}</Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>{stepCopy.subtitle}</Text>
      </View>

      {phase === "structure" ? (
        <StructurePhaseContent
          selection={selection}
          onSelectOption={selectOption}
          onCustomLabelChange={(customLabel) => updateSelection({ customLabel })}
        />
      ) : (
        <CountPhaseContent
          resolvedLabelBase={resolvedLabelBase}
          count={count}
          suggestedCount={suggestedCount}
          onDecrement={() => updateSelection({ count: Math.max(MIN_COUNT, count - 1) })}
          onIncrement={() => updateSelection({ count: Math.min(MAX_COUNT, count + 1) })}
          onSelectCount={(next) => updateSelection({ count: next })}
        />
      )}

      {errorMessage !== null ? (
        <Text variant="caption" color="secondary" style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      <View style={styles.actions}>
        <Button
          title={continueLabel}
          intent="primary"
          size="lg"
          state={resolveContinueButtonState(isSubmitting, phase, structureReady)}
          onPress={() => {
            if (phase === "structure") {
              handleContinueFromStructure();
            } else {
              void handleContinueFromCount();
            }
          }}
        />
      </View>
    </Screen>
  );
}

function StructurePhaseContent({
  selection,
  onSelectOption,
  onCustomLabelChange,
}: Readonly<{
  selection: SubjectStructureSelection;
  onSelectOption: (optionId: string) => void;
  onCustomLabelChange: (value: string) => void;
}>): ReactElement {
  const isCustomSelected = selection.optionId === CUSTOM_OPTION_ID;
  const isNoStructureSelected = selection.optionId === NO_STRUCTURE_OPTION_ID;

  return (
    <View>
      <View style={styles.grid}>
        <View style={styles.tile}>
          <SelectableCard
            title="No structure"
            subtitle="Skip this subject"
            selected={isNoStructureSelected}
            layout="tile"
            leading={<OptionIcon icon={Ban} selected={isNoStructureSelected} />}
            onPress={() => onSelectOption(NO_STRUCTURE_OPTION_ID)}
          />
        </View>

        {STRUCTURE_TYPE_OPTIONS.map((option) => {
          const selected = selection.optionId === option.id;

          return (
            <View key={option.id} style={styles.tile}>
              <SelectableCard
                title={option.label}
                subtitle={option.hint}
                selected={selected}
                layout="tile"
                leading={<OptionIcon icon={option.icon} selected={selected} />}
                onPress={() => onSelectOption(option.id)}
              />
            </View>
          );
        })}
      </View>

      {isCustomSelected ? (
        <View style={styles.customPanel}>
          <Text variant="label" color="primary">What does your syllabus call them?</Text>
          <Input
            value={selection.customLabel}
            onChangeText={onCustomLabelChange}
            placeholder="e.g. Topics"
            autoFocus
            style={styles.customInput}
          />
          <View style={styles.customExamples}>
            {CUSTOM_STRUCTURE_EXAMPLES.map((example) => (
              <SelectableChip
                key={example}
                label={example}
                selected={selection.customLabel === example}
                onPress={() => onCustomLabelChange(example)}
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function CountPhaseContent({
  resolvedLabelBase,
  count,
  suggestedCount,
  onDecrement,
  onIncrement,
  onSelectCount,
}: Readonly<{
  resolvedLabelBase: string;
  count: number;
  suggestedCount: number;
  onDecrement: () => void;
  onIncrement: () => void;
  onSelectCount: (value: number) => void;
}>): ReactElement {
  return (
    <View style={styles.counterCard}>
      <View style={styles.counterRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${resolvedLabelBase}`}
          onPress={onDecrement}
          style={({ pressed }) => [styles.stepperButton, pressed && styles.stepperButtonPressed]}
        >
          <Minus size={STEPPER_ICON_SIZE_DP} color={mobileTokens.text.primary} />
        </Pressable>

        <View style={styles.counterValue}>
          <Text variant="figureXl" color="primary" fontFamily="mono" style={styles.counterFigure}>{count}</Text>
          <Text variant="caption" color="tertiary" numberOfLines={1}>{resolvedLabelBase}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Increase ${resolvedLabelBase}`}
          onPress={onIncrement}
          style={({ pressed }) => [styles.stepperButton, pressed && styles.stepperButtonPressed]}
        >
          <Plus size={STEPPER_ICON_SIZE_DP} color={mobileTokens.text.primary} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickCountRow}>
        {quickCounts(suggestedCount).map((quick) => (
          <SelectableChip
            key={quick}
            label={`${quick} ${resolvedLabelBase}`}
            selected={count === quick}
            onPress={() => onSelectCount(quick)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function OptionIcon({
  icon: Icon,
  selected,
}: Readonly<{ icon: ComponentType<{ size?: number; color?: string }>; selected: boolean }>): ReactElement {
  return (
    <View style={[styles.optionIcon, selected ? styles.optionIconSelected : styles.optionIconUnselected]}>
      <Icon size={STEPPER_ICON_SIZE_DP - 2} color={selected ? mobileTokens.accent.strong : mobileTokens.text.tertiary} />
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: parseInt(mobileTokens.space.sm, 10),
  },
  tile: {
    flexBasis: TILE_FLEX_BASIS,
    flexGrow: 1,
  },
  optionIcon: {
    width: parseInt(mobileTokens.control.sm, 10),
    height: parseInt(mobileTokens.control.sm, 10),
    borderRadius: parseInt(mobileTokens.radius.full, 10),
    alignItems: "center",
    justifyContent: "center",
  },
  optionIconSelected: {
    backgroundColor: mobileTokens.accent.subtle,
  },
  optionIconUnselected: {
    backgroundColor: mobileTokens.surface.overlay,
  },
  customPanel: {
    marginTop: parseInt(mobileTokens.space.md, 10),
    borderRadius: parseInt(mobileTokens.radius.lg, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: mobileTokens.accent.default,
    backgroundColor: mobileTokens.accent.subtle,
    padding: parseInt(mobileTokens.space.md, 10),
  },
  customInput: {
    marginTop: parseInt(mobileTokens.space.sm, 10),
  },
  customExamples: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: parseInt(mobileTokens.space.sm, 10),
    marginTop: parseInt(mobileTokens.space.md, 10),
  },
  counterCard: {
    borderRadius: parseInt(mobileTokens.radius.lg, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: mobileTokens.border.subtle,
    backgroundColor: mobileTokens.surface.raised,
    padding: parseInt(mobileTokens.space.lg, 10),
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: parseInt(mobileTokens.space.md, 10),
  },
  stepperButton: {
    width: parseInt(mobileTokens.control.lg, 10),
    height: parseInt(mobileTokens.control.lg, 10),
    borderRadius: parseInt(mobileTokens.radius.full, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: mobileTokens.border.default,
    backgroundColor: mobileTokens.surface.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperButtonPressed: {
    opacity: parseFloat(mobileTokens.state.mutedOpacity),
  },
  counterValue: {
    flex: 1,
    alignItems: "center",
    minWidth: 0,
  },
  counterFigure: {
    color: mobileTokens.accent.strong,
  },
  quickCountRow: {
    gap: parseInt(mobileTokens.space.sm, 10),
    marginTop: parseInt(mobileTokens.space.lg, 10),
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
