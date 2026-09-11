import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { ArrowLeft } from "lucide-react-native";

import type {
  AcademicApiStructureUnitKind,
  AcademicApiStructureUnitNode,
  AcademicApiSubjectStructureTree,
} from "@avora/core/api/academic";
import type { StructureUnitId } from "@avora/core/identity";
import { StructureTree } from "@avora/ui-mobile/domain-components";
import type { StructureTreeNodeContract } from "@avora/ui-mobile/domain-components";
import { ErrorState, Skeleton, Text } from "@avora/ui-mobile/primitives";
import { mobileTokens } from "@avora/ui-mobile/tokens";

import { getAcademicClient } from "../../src/composition";
import { useAccessToken } from "../../src/auth/useAccessToken";
import { TabScreen } from "../../src/navigation/TabScreen";

const BACK_BUTTON_ICON_SIZE_DP = 18;
const SKELETON_STRUCTURE_ROW_HEIGHT_DP = 64;

// NN-01: the only place a `unitKind` becomes display copy. Every other line
// of JSX below reads `structureTypeLabel` off the mapped node — nothing
// hardcodes "Unit", and a subject that only ever uses `custom` still gets an
// honest label ("Section") instead of a borrowed one.
const STRUCTURE_TYPE_LABEL: Record<AcademicApiStructureUnitKind, string> = {
  module: "Module",
  topic: "Topic",
  week: "Week",
  lecture: "Lecture",
  assignment_group: "Assignment group",
  exam_area: "Exam area",
  custom: "Section",
};

/**
 * There is no per-subject progress, focus recommendation, streak, quiz
 * score, attendance or upcoming-deadline data wired to mobile yet — only
 * the structure tree. This screen shows the two things that are real: the
 * subject's own identity (name, code) and its declared structure, exactly
 * as `reference/prototypes/avora-subject-dashboard` establishes the pattern
 * (subject-header + academic-structure), minus every module with nothing
 * real behind it. Rule HM-02/ES-02.
 */
export default function SubjectDetailRoute(): ReactElement {
  const router = useRouter();
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();
  const { accessToken, isLoading: isLoadingToken, isSignedOut } = useAccessToken();

  const [subjectEntry, setSubjectEntry] = useState<AcademicApiSubjectStructureTree | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (accessToken === null) {
      return;
    }

    let isCancelled = false;

    // Deferred into a microtask so a synchronous throw from getAcademicClient
    // (e.g. env validation) becomes a rejection the .catch() below already
    // handles, instead of an uncaught exception inside this effect.
    Promise.resolve()
      .then(() => getAcademicClient(accessToken).getStructureTree())
      .then((response) => {
        if (isCancelled) {
          return;
        }

        const matchingSubject =
          response.tree.terms
            .flatMap((term) => term.subjects)
            .find((entry) => entry.subject.subjectId === subjectId) ?? null;

        setSubjectEntry(matchingSubject);
        setErrorMessage(null);
        setHasLoadedOnce(true);
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Could not load this subject.");
          setHasLoadedOnce(true);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [accessToken, subjectId, retryCount]);

  const isLoading = isLoadingToken || (!isSignedOut && !hasLoadedOnce);

  return (
    <TabScreen activeDestination="subjects" glow>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={() => router.back()}
        hitSlop={parseInt(mobileTokens.space.sm, 10)}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <ArrowLeft size={BACK_BUTTON_ICON_SIZE_DP} color={mobileTokens.text.primary} />
      </Pressable>

      {isSignedOut ? (
        <ErrorState
          title="You're signed out"
          message="Sign in again to see this subject."
          retryLabel="Sign in"
          onRetry={() => router.replace("/(auth)")}
          style={styles.errorState}
        />
      ) : isLoading ? (
        <View style={styles.loadingBlock}>
          <Skeleton width="70%" height={parseInt(mobileTokens.type.display.lineHeight, 10)} />
          <Skeleton
            width="40%"
            height={parseInt(mobileTokens.type.caption.lineHeight, 10)}
            style={styles.skeletonMeta}
          />
          <View style={styles.skeletonStructureList}>
            <Skeleton height={SKELETON_STRUCTURE_ROW_HEIGHT_DP} borderRadius={parseInt(mobileTokens.radius.lg, 10)} />
            <Skeleton height={SKELETON_STRUCTURE_ROW_HEIGHT_DP} borderRadius={parseInt(mobileTokens.radius.lg, 10)} />
            <Skeleton height={SKELETON_STRUCTURE_ROW_HEIGHT_DP} borderRadius={parseInt(mobileTokens.radius.lg, 10)} />
          </View>
        </View>
      ) : errorMessage !== null ? (
        <ErrorState
          title="Couldn't load this subject"
          message={errorMessage}
          onRetry={() => {
            setHasLoadedOnce(false);
            setRetryCount((count) => count + 1);
          }}
          style={styles.errorState}
        />
      ) : subjectEntry === null ? (
        <ErrorState
          title="Subject not found"
          message="This subject may have been removed, or hasn't finished loading."
          retryLabel="Back to Subjects"
          onRetry={() => router.replace("/subjects")}
          style={styles.errorState}
        />
      ) : (
        <SubjectDashboardContent entry={subjectEntry} />
      )}
    </TabScreen>
  );
}

function SubjectDashboardContent({ entry }: { entry: AcademicApiSubjectStructureTree }): ReactElement {
  const structureUnitCount = countStructureUnitNodes(entry.units);
  const treeNodes = entry.units.map((node) => mapStructureUnitNodeToTreeNode(node, 0));

  return (
    <View>
      <Text variant="display" color="primary" style={styles.subjectTitle}>
        {entry.subject.displayName}
      </Text>

      {entry.subject.subjectCode !== null ? (
        <View style={styles.metaRow}>
          <View style={styles.codePill}>
            <Text variant="caption" color="primary" fontFamily="mono">{entry.subject.subjectCode}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.structureSection}>
        <Text variant="titleSm" color="primary">Structure</Text>
        <Text variant="caption" color="tertiary" style={styles.structureCaption}>
          {structureUnitCount} structure unit{structureUnitCount === 1 ? "" : "s"}
        </Text>

        {treeNodes.length === 0 ? (
          // NN-01/FR-015: zero declared structure is a legitimate, first-class
          // state — never an error, never a fabricated "get started" CTA to a
          // feature (upload) that isn't wired up from this screen.
          <View style={styles.emptyStructure}>
            <Text variant="body" color="secondary" style={styles.emptyStructureText}>
              This subject has no structure yet.
            </Text>
          </View>
        ) : (
          <View style={styles.structureTreeWrapper}>
            <StructureTree
              nodes={treeNodes}
              onSelectNode={() => {
                // No destination exists yet for a selected structure unit — no
                // resource/notes screen is wired to structure units on mobile.
                // Intentionally a no-op rather than an invented navigation target.
              }}
            />
          </View>
        )}
      </View>
    </View>
  );
}

function countStructureUnitNodes(nodes: readonly AcademicApiStructureUnitNode[]): number {
  return nodes.reduce((total, node) => total + 1 + countStructureUnitNodes(node.children), 0);
}

function mapStructureUnitNodeToTreeNode(
  node: AcademicApiStructureUnitNode,
  depth: number,
): StructureTreeNodeContract {
  return {
    // The wire DTO's `structureUnitId` is a plain string
    // (packages/core/api/academic/contracts.ts); `StructureTreeNodeContract`
    // requires the branded `StructureUnitId` identity type, and no runtime
    // factory exists for it (it is a type-only phantom brand). This is the
    // same client-response boundary cast already established in
    // apps/web/app/api/academic/_shared/academic-mapper.ts.
    structureUnitId: node.unit.structureUnitId as unknown as StructureUnitId,
    structureTypeLabel: STRUCTURE_TYPE_LABEL[node.unit.unitKind],
    title: node.unit.title,
    depth,
    children: node.children.map((child) => mapStructureUnitNodeToTreeNode(child, depth + 1)),
  };
}

const styles = StyleSheet.create({
  pressed: {
    opacity: parseFloat(mobileTokens.state.mutedOpacity),
  },
  backButton: {
    width: parseInt(mobileTokens.control.md, 10),
    height: parseInt(mobileTokens.control.md, 10),
    borderRadius: parseInt(mobileTokens.radius.xl, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: mobileTokens.border.subtle,
    backgroundColor: mobileTokens.surface.raised,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingBlock: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
    gap: parseInt(mobileTokens.space.sm, 10),
  },
  skeletonStructureList: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
    gap: parseInt(mobileTokens.space.sm, 10),
  },
  skeletonMeta: {
    marginTop: parseInt(mobileTokens.space.xs, 10),
  },
  errorState: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
    alignItems: "flex-start",
  },
  subjectTitle: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: parseInt(mobileTokens.space.md, 10),
  },
  codePill: {
    borderRadius: parseInt(mobileTokens.radius.full, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: mobileTokens.border.subtle,
    backgroundColor: mobileTokens.surface.overlay,
    paddingHorizontal: parseInt(mobileTokens.space.sm, 10),
    paddingVertical: parseInt(mobileTokens.space.xs, 10) / 2,
  },
  structureSection: {
    marginTop: parseInt(mobileTokens.space.xxl, 10),
  },
  structureCaption: {
    marginTop: parseInt(mobileTokens.space.xs, 10) / 2,
    marginBottom: parseInt(mobileTokens.space.md, 10),
  },
  structureTreeWrapper: {
    marginTop: parseInt(mobileTokens.space.xs, 10),
  },
  emptyStructure: {
    marginTop: parseInt(mobileTokens.space.sm, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderStyle: "dashed",
    borderColor: mobileTokens.border.default,
    borderRadius: parseInt(mobileTokens.radius.lg, 10),
    padding: parseInt(mobileTokens.space.lg, 10),
  },
  emptyStructureText: {
    textAlign: "center",
  },
});
