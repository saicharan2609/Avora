import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { ChevronRight } from "lucide-react-native";

import type {
  AcademicApiStructureUnitNode,
  AcademicApiSubjectStructureTree,
  AcademicApiTermStructureTree,
} from "@avora/core/api/academic";
import { Card, ErrorState, Skeleton, Text } from "@avora/ui-mobile/primitives";
import { mobileTokens } from "@avora/ui-mobile/tokens";

import { getAcademicClient } from "../../src/composition";
import { useAccessToken } from "../../src/auth/useAccessToken";
import { TabScreen } from "../../src/navigation/TabScreen";

const CHEVRON_SIZE_DP = 16;
const SKELETON_ROW_HEIGHT_DP = 72;

/**
 * There is no per-subject progress, "today's focus" or resource count on
 * mobile yet — only the structure tree (`getStructureTree`). This screen
 * lists exactly what that call returns: the active term's subjects and how
 * many structure units each one declares. Rule HM-02/ES-02: a derived
 * module with no data source is omitted, never faked.
 */
export default function SubjectsRoute(): ReactElement {
  const router = useRouter();
  const { accessToken, isLoading: isLoadingToken, isSignedOut } = useAccessToken();

  const [term, setTerm] = useState<AcademicApiTermStructureTree | null>(null);
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

        const activeOrFirstTerm =
          response.tree.terms.find((entry) => entry.term.lifecycleState === "active") ??
          response.tree.terms[0] ??
          null;

        setTerm(activeOrFirstTerm);
        setErrorMessage(null);
        setHasLoadedOnce(true);
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Could not load your subjects.");
          setHasLoadedOnce(true);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [accessToken, retryCount]);

  const isLoading = isLoadingToken || (!isSignedOut && !hasLoadedOnce);

  return (
    <TabScreen activeDestination="subjects">
      <Text variant="display" color="primary">Subjects</Text>
      {term !== null ? (
        <Text variant="caption" color="tertiary" style={styles.termLabel}>
          {term.term.label}
        </Text>
      ) : null}

      {isSignedOut ? (
        <ErrorState
          title="You're signed out"
          message="Sign in again to see your subjects."
          retryLabel="Sign in"
          onRetry={() => router.replace("/(auth)")}
          style={styles.errorState}
        />
      ) : isLoading ? (
        <View style={styles.listContainer}>
          <Skeleton height={SKELETON_ROW_HEIGHT_DP} borderRadius={parseInt(mobileTokens.radius.lg, 10)} />
          <Skeleton height={SKELETON_ROW_HEIGHT_DP} borderRadius={parseInt(mobileTokens.radius.lg, 10)} />
          <Skeleton height={SKELETON_ROW_HEIGHT_DP} borderRadius={parseInt(mobileTokens.radius.lg, 10)} />
        </View>
      ) : errorMessage !== null ? (
        <ErrorState
          title="Couldn't load your subjects"
          message={errorMessage}
          onRetry={() => {
            setHasLoadedOnce(false);
            setRetryCount((count) => count + 1);
          }}
          style={styles.errorState}
        />
      ) : term === null || term.subjects.length === 0 ? (
        <View style={styles.emptyState}>
          <Text variant="body" color="secondary" style={styles.emptyStateText}>
            No subjects yet.
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {term.subjects.map((entry) => (
            <SubjectRow
              key={entry.subject.subjectId}
              entry={entry}
              onPress={() => router.push(`/subjects/${entry.subject.subjectId}`)}
            />
          ))}
        </View>
      )}
    </TabScreen>
  );
}

function SubjectRow({
  entry,
  onPress,
}: {
  entry: AcademicApiSubjectStructureTree;
  onPress: () => void;
}): ReactElement {
  const structureUnitCount = countStructureUnitNodes(entry.units);

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {({ pressed }) => (
        <Card variant="raised" style={[styles.rowCard, pressed && styles.rowCardPressed]}>
          <View style={styles.rowTextBlock}>
            <Text variant="bodyLg" color="primary" numberOfLines={1}>
              {entry.subject.displayName}
            </Text>
            <View style={styles.rowMetaLine}>
              {entry.subject.subjectCode !== null ? (
                <View style={styles.codePill}>
                  <Text variant="caption" color="primary" fontFamily="mono">{entry.subject.subjectCode}</Text>
                </View>
              ) : null}
              <Text variant="caption" color="tertiary">
                {structureUnitCount} structure unit{structureUnitCount === 1 ? "" : "s"}
              </Text>
            </View>
          </View>
          <ChevronRight size={CHEVRON_SIZE_DP} color={mobileTokens.text.tertiary} />
        </Card>
      )}
    </Pressable>
  );
}

function countStructureUnitNodes(nodes: readonly AcademicApiStructureUnitNode[]): number {
  return nodes.reduce((total, node) => total + 1 + countStructureUnitNodes(node.children), 0);
}

const styles = StyleSheet.create({
  termLabel: {
    marginTop: parseInt(mobileTokens.space.xs, 10),
  },
  listContainer: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
    gap: parseInt(mobileTokens.space.sm, 10),
  },
  errorState: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
    alignItems: "flex-start",
  },
  emptyState: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderStyle: "dashed",
    borderColor: mobileTokens.border.default,
    borderRadius: parseInt(mobileTokens.radius.lg, 10),
    padding: parseInt(mobileTokens.space.lg, 10),
  },
  emptyStateText: {
    textAlign: "center",
  },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: parseInt(mobileTokens.space.md, 10),
  },
  rowCardPressed: {
    opacity: parseFloat(mobileTokens.state.mutedOpacity),
  },
  rowTextBlock: {
    flex: 1,
    gap: parseInt(mobileTokens.space.xs, 10),
  },
  rowMetaLine: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: parseInt(mobileTokens.space.sm, 10),
  },
  codePill: {
    borderRadius: parseInt(mobileTokens.radius.full, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: mobileTokens.border.subtle,
    backgroundColor: mobileTokens.surface.overlay,
    paddingHorizontal: parseInt(mobileTokens.space.sm, 10),
    paddingVertical: parseInt(mobileTokens.space.xs, 10) / 2,
  },
});
