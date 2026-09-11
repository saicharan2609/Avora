import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, View, StyleSheet } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { ChevronRight, Layers } from "lucide-react-native";

import type {
  AcademicApiSetupProgress,
  AcademicApiStructureTree,
  AcademicApiStructureUnitNode,
  AcademicApiSubjectStructureTree,
  AcademicApiTerm,
  AcademicApiTermStructureTree,
} from "@avora/core/api/academic";

import { getAcademicClient } from "../src/composition";
import { useAccessToken } from "../src/auth/useAccessToken";
import { TabScreen } from "../src/navigation/TabScreen";
import { AvoraMark, Card, Text, Skeleton, ErrorState } from "@avora/ui-mobile/primitives";
import { InitialsToken } from "@avora/ui-mobile/domain-components";
import { mobileTokens } from "@avora/ui-mobile/tokens";

/**
 * Home shows only what mobile actually has real data for: setup counts and
 * the subjects/units already declared in the structure tree (both from the
 * same `getSetupProgress`/`getStructureTree` calls onboarding already uses).
 * There is still no backend aggregator for exam readiness, attendance,
 * "today's goal", "next best action" or quiz accuracy, and the PRD's
 * evidence rule (D3/D4, docs/DESIGN-SYSTEM.md §7.1) forbids asserting any of
 * those with nothing real behind them — so none of it is rendered, faked or
 * greyed out. Rule OB-09/ES-02: a derived module with no data yet is absent,
 * not faked. The same applies per-subject: there is no completion signal on
 * `AcademicApiStructureUnit`, so subject cards show a real unit count and no
 * progress ring.
 */

type HomeData = Readonly<{
  progress: AcademicApiSetupProgress;
  tree: AcademicApiStructureTree;
}>;

// Not a themed value (no color/spacing/radius/duration/font/shadow), so it is
// a named layout constant rather than a design token — same precedent as the
// bare *_SIZE_DP constants in BottomNavBar.tsx/StructureTree.tsx.
const SUBJECT_CARD_WIDTH_DP = 176;
const SUBJECT_CARD_SKELETON_HEIGHT_DP = 132;
const SECTION_HEADER_CHEVRON_SIZE_DP = 16;
const SUBJECT_CARD_FOOTER_ICON_SIZE_DP = 12;

export default function HomeRoute(): ReactElement {
  const router = useRouter();
  const { accessToken, isLoading: isLoadingToken, isSignedOut } = useAccessToken();
  const [data, setData] = useState<HomeData | null>(null);
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
      .then(() => {
        const client = getAcademicClient(accessToken);
        return Promise.all([client.getSetupProgress(), client.getStructureTree()]);
      })
      .then(([progressResponse, treeResponse]) => {
        if (!isCancelled) {
          setData({ progress: progressResponse.progress, tree: treeResponse.tree });
          setErrorMessage(null);
          setHasLoadedOnce(true);
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Could not load your workspace.");
          setHasLoadedOnce(true);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [accessToken, retryCount]);

  const greeting = timeAwareGreeting();
  const isLoading = isLoadingToken || (!isSignedOut && !hasLoadedOnce);

  return (
    <TabScreen activeDestination="home" glow>
      <View style={styles.header}>
        <AvoraMark sizeDp={28} />
        <Text variant="eyebrow" color="tertiary" style={styles.wordmark}>Avora</Text>
      </View>

      <Text variant="display" color="primary" style={styles.greeting}>{greeting}</Text>

      <HomeContent
        isLoading={isLoading}
        isSignedOut={isSignedOut}
        errorMessage={errorMessage}
        data={data}
        onRetry={() => {
          setHasLoadedOnce(false);
          setRetryCount((count) => count + 1);
        }}
        onSignIn={() => router.replace("/(auth)")}
        onSubjectPress={(subjectId) => router.push(`/subjects/${subjectId}`)}
      />

      <Text variant="body" color="secondary" style={styles.reassurance}>
        Your workspace is set up. Study tools will appear here as they're ready.
      </Text>
    </TabScreen>
  );
}

type HomeContentProps = Readonly<{
  isLoading: boolean;
  isSignedOut: boolean;
  errorMessage: string | null;
  data: HomeData | null;
  onRetry: () => void;
  onSignIn: () => void;
  onSubjectPress: (subjectId: string) => void;
}>;

function HomeContent({ isLoading, isSignedOut, errorMessage, data, onRetry, onSignIn, onSubjectPress }: HomeContentProps): ReactElement {
  const { termBadgeLabel, subjectSubtrees } = resolveHomeViewModel(data);

  return (
    <>
      {termBadgeLabel !== null ? (
        <View style={styles.termBadge}>
          <View style={styles.termBadgeDot} />
          <Text variant="caption" color="tertiary">{termBadgeLabel}</Text>
        </View>
      ) : null}

      {isSignedOut ? (
        <ErrorState
          title="You're signed out"
          message="Sign in again to see your workspace."
          retryLabel="Sign in"
          onRetry={onSignIn}
          style={styles.errorState}
        />
      ) : isLoading ? (
        <HomeLoadingSkeleton />
      ) : errorMessage !== null ? (
        <ErrorState
          title="Couldn't load your workspace"
          message={errorMessage}
          onRetry={onRetry}
          style={styles.errorState}
        />
      ) : data !== null ? (
        <HomeWorkspaceSummary
          progress={data.progress}
          subjectSubtrees={subjectSubtrees}
          onSubjectPress={onSubjectPress}
        />
      ) : null}
    </>
  );
}

function HomeLoadingSkeleton(): ReactElement {
  return (
    <>
      <View style={styles.summarySkeleton}>
        <Skeleton width="60%" height={parseInt(mobileTokens.type.body.lineHeight, 10)} />
      </View>
      <View style={styles.subjectsSkeletonRow}>
        <Skeleton
          width={SUBJECT_CARD_WIDTH_DP}
          height={SUBJECT_CARD_SKELETON_HEIGHT_DP}
          borderRadius={parseInt(mobileTokens.radius.lg, 10)}
        />
        <Skeleton
          width={SUBJECT_CARD_WIDTH_DP}
          height={SUBJECT_CARD_SKELETON_HEIGHT_DP}
          borderRadius={parseInt(mobileTokens.radius.lg, 10)}
        />
      </View>
    </>
  );
}

type HomeWorkspaceSummaryProps = Readonly<{
  progress: AcademicApiSetupProgress;
  subjectSubtrees: readonly AcademicApiSubjectStructureTree[];
  onSubjectPress: (subjectId: string) => void;
}>;

function HomeWorkspaceSummary({ progress, subjectSubtrees, onSubjectPress }: HomeWorkspaceSummaryProps): ReactElement {
  const router = useRouter();

  return (
    <>
      <View style={styles.summaryRow}>
        <View style={styles.statBlock}>
          <Text variant="figure" color="primary">{progress.subjectCount}</Text>
          <Text variant="caption" color="tertiary">
            subject{progress.subjectCount === 1 ? "" : "s"}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBlock}>
          <Text variant="figure" color="primary">{progress.structureUnitCount}</Text>
          <Text variant="caption" color="tertiary">
            unit{progress.structureUnitCount === 1 ? "" : "s"}
          </Text>
        </View>
      </View>

      <SectionHeader
        title="Subjects"
        meta={String(progress.subjectCount)}
        actionLabel={subjectSubtrees.length > 0 ? "All" : undefined}
        onActionPress={subjectSubtrees.length > 0 ? () => router.push("/subjects") : undefined}
      />

      {subjectSubtrees.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subjectsRow}
        >
          {subjectSubtrees.map((subjectSubtree) => (
            <SubjectCard
              key={subjectSubtree.subject.subjectId}
              subjectSubtree={subjectSubtree}
              onPress={() => onSubjectPress(subjectSubtree.subject.subjectId)}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptySubjects}>
          <Text variant="body" color="secondary" style={styles.emptySubjectsText}>
            Your subjects will appear here once you add them.
          </Text>
        </View>
      )}
    </>
  );
}

type SectionHeaderProps = Readonly<{
  title: string;
  meta?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
}>;

function SectionHeader({ title, meta, actionLabel, onActionPress, style }: SectionHeaderProps): ReactElement {
  return (
    <View style={[styles.sectionHeader, style]}>
      <View style={styles.sectionHeaderTitleRow}>
        <Text variant="titleSm" color="primary">{title}</Text>
        {meta !== undefined ? (
          <Text variant="caption" color="tertiary" fontFamily="mono">{meta}</Text>
        ) : null}
      </View>
      {actionLabel !== undefined && onActionPress ? (
        <Pressable onPress={onActionPress} style={styles.sectionHeaderAction} hitSlop={parseInt(mobileTokens.space.sm, 10)}>
          <Text variant="caption" color="tertiary">{actionLabel}</Text>
          <ChevronRight size={SECTION_HEADER_CHEVRON_SIZE_DP} color={mobileTokens.text.tertiary} />
        </Pressable>
      ) : null}
    </View>
  );
}

type SubjectCardProps = Readonly<{
  subjectSubtree: AcademicApiSubjectStructureTree;
  onPress: () => void;
}>;

function SubjectCard({ subjectSubtree, onPress }: SubjectCardProps): ReactElement {
  const { subject, units } = subjectSubtree;
  const unitCount = countStructureUnits(units);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.subjectCardPressed]}>
      <Card variant="raised" style={styles.subjectCard}>
        <InitialsToken label={subjectInitials(subject.displayName)} shape="squircle" />
        <Text variant="titleSm" color="primary" style={styles.subjectName} numberOfLines={2}>
          {subject.displayName}
        </Text>
        <View style={styles.subjectCardFooter}>
          <Layers size={SUBJECT_CARD_FOOTER_ICON_SIZE_DP} color={mobileTokens.text.tertiary} />
          <Text variant="caption" color="tertiary">
            {unitCount} unit{unitCount === 1 ? "" : "s"}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

type HomeViewModel = Readonly<{
  termBadgeLabel: string | null;
  subjectSubtrees: readonly AcademicApiSubjectStructureTree[];
}>;

function resolveHomeViewModel(data: HomeData | null): HomeViewModel {
  const activeTermSubtree = data === null ? null : selectActiveTermSubtree(data.tree);

  if (activeTermSubtree === null) {
    return { termBadgeLabel: null, subjectSubtrees: [] };
  }

  return {
    termBadgeLabel: termBadgeText(activeTermSubtree.term),
    subjectSubtrees: activeTermSubtree.subjects,
  };
}

function selectActiveTermSubtree(
  tree: AcademicApiStructureTree,
): AcademicApiTermStructureTree | null {
  if (tree.terms.length === 0) {
    return null;
  }

  return (
    tree.terms.find((termSubtree) => termSubtree.term.lifecycleState === "active") ??
    tree.terms[0] ??
    null
  );
}

function termBadgeText(term: AcademicApiTerm): string | null {
  const detail = term.branchName ?? term.programmeName ?? term.institutionName;

  if (detail === null) {
    return null;
  }

  return `${term.label} · ${detail}`;
}

function subjectInitials(displayName: string): string {
  const words = displayName.trim().split(/\s+/).filter((word) => word.length > 0);
  const initials = words.slice(0, 2).map((word) => word.charAt(0).toUpperCase());

  return initials.join("");
}

function countStructureUnits(nodes: readonly AcademicApiStructureUnitNode[]): number {
  return nodes.reduce((total, node) => total + 1 + countStructureUnits(node.children), 0);
}

function timeAwareGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: parseInt(mobileTokens.space.sm, 10),
  },
  wordmark: {
    color: mobileTokens.text.secondary,
  },
  greeting: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
  },
  termBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: parseInt(mobileTokens.space.xs, 10),
    marginTop: parseInt(mobileTokens.space.sm, 10),
    paddingHorizontal: parseInt(mobileTokens.space.sm, 10),
    paddingVertical: parseInt(mobileTokens.space.xs, 10),
    borderRadius: parseInt(mobileTokens.radius.full, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: mobileTokens.border.subtle,
    backgroundColor: mobileTokens.surface.raised,
  },
  termBadgeDot: {
    width: parseInt(mobileTokens.layout.progressTrack, 10),
    height: parseInt(mobileTokens.layout.progressTrack, 10),
    borderRadius: parseInt(mobileTokens.radius.full, 10),
    backgroundColor: mobileTokens.accent.default,
  },
  summarySkeleton: {
    marginTop: parseInt(mobileTokens.space.lg, 10),
  },
  subjectsSkeletonRow: {
    flexDirection: "row",
    gap: parseInt(mobileTokens.space.sm, 10),
    marginTop: parseInt(mobileTokens.space.lg, 10),
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: parseInt(mobileTokens.space.lg, 10),
    gap: parseInt(mobileTokens.space.lg, 10),
  },
  statBlock: {
    alignItems: "flex-start",
    gap: parseInt(mobileTokens.space.xs, 10),
  },
  statDivider: {
    width: parseInt(mobileTokens.layout.divider, 10),
    height: parseInt(mobileTokens.type.figure.lineHeight, 10),
    backgroundColor: mobileTokens.border.subtle,
  },
  errorState: {
    marginTop: parseInt(mobileTokens.space.lg, 10),
    alignItems: "flex-start",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: parseInt(mobileTokens.space.xxl, 10),
    marginBottom: parseInt(mobileTokens.space.sm, 10),
  },
  sectionHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: parseInt(mobileTokens.space.sm, 10),
  },
  sectionHeaderAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: parseInt(mobileTokens.space.xs, 10),
  },
  subjectsRow: {
    gap: parseInt(mobileTokens.space.sm, 10),
    paddingRight: parseInt(mobileTokens.space.md, 10),
    paddingBottom: parseInt(mobileTokens.space.xs, 10),
  },
  subjectCard: {
    width: SUBJECT_CARD_WIDTH_DP,
    padding: parseInt(mobileTokens.space.md, 10),
    gap: parseInt(mobileTokens.space.sm, 10),
  },
  subjectCardPressed: {
    opacity: parseFloat(mobileTokens.state.mutedOpacity),
  },
  subjectName: {
    marginTop: parseInt(mobileTokens.space.xs, 10),
  },
  subjectCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: parseInt(mobileTokens.space.xs, 10),
    borderTopWidth: parseInt(mobileTokens.layout.divider, 10),
    borderTopColor: mobileTokens.border.subtle,
    paddingTop: parseInt(mobileTokens.space.sm, 10),
  },
  emptySubjects: {
    marginTop: parseInt(mobileTokens.space.sm, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderStyle: "dashed",
    borderColor: mobileTokens.border.default,
    borderRadius: parseInt(mobileTokens.radius.lg, 10),
    padding: parseInt(mobileTokens.space.lg, 10),
  },
  emptySubjectsText: {
    textAlign: "center",
  },
  reassurance: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
  },
});
