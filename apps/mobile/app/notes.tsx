import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Check, ChevronDown, NotebookText, Search, SearchX, X } from "lucide-react-native";

import type {
  AcademicApiStructureTree,
  AcademicApiSubjectStructureTree,
} from "@avora/core/api/academic";
import type { StructureUnitId } from "@avora/core/identity";
import { StructureTree } from "@avora/ui-mobile/domain-components";
import type { StructureTreeNodeContract } from "@avora/ui-mobile/domain-components";
import { BottomSheet, Card, ErrorState, GlassSurface, Input, Skeleton, Text } from "@avora/ui-mobile/primitives";
import { mobileTokens } from "@avora/ui-mobile/tokens";

import { getAcademicClient } from "../src/composition";
import { useAccessToken } from "../src/auth/useAccessToken";
import { TabScreen } from "../src/navigation/TabScreen";
import {
  countStructureUnitNodes,
  filterStructureTreeNodesByTitleQuery,
  findActiveTermStructureTree,
  mapStructureUnitNodesToTreeContractNodes,
} from "../src/academic/structureTreeViewMapper";

const HEADER_ICON_SIZE_DP = 20;
const CHEVRON_SIZE_DP = 16;
const SEARCH_ICON_SIZE_DP = 18;
const CLEAR_ICON_SIZE_DP = 14;
const CHECK_ICON_SIZE_DP = 14;
const EMPTY_STATE_ICON_SIZE_DP = 24;
const CLEAR_BUTTON_SIZE_DP = 28;

type SelectedStructureNode = Readonly<{
  title: string;
  structureTypeLabel: string;
}>;

/**
 * Notes has no note-taking backend on mobile yet — no `note`/`resource`
 * port exists in `apps/mobile/src` (only `getAcademicClient` for term /
 * subject / structure-unit setup does, same as `home.tsx` and
 * `(onboarding)/completion.tsx`). This screen is the real navigational
 * shell around the one real data source available — the academic structure
 * tree — and is honest that note content itself isn't here yet, rather
 * than reproducing the reference prototype's dead "Create note / Scan /
 * Record / Import" affordances.
 */
export default function NotesRoute(): ReactElement {
  const router = useRouter();
  const { accessToken, isLoading: isLoadingToken, isSignedOut } = useAccessToken();

  const [tree, setTree] = useState<AcademicApiStructureTree | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [isSubjectPickerOpen, setIsSubjectPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<SelectedStructureNode | null>(null);

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

        setTree(response.tree);
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

  const subjects = readSubjectsForActiveTerm(tree);
  const selectedSubjectTree = resolveSelectedSubjectTree(subjects, selectedSubjectId);

  const treeNodes = useMemo(
    () => mapStructureUnitNodesToTreeContractNodes(selectedSubjectTree?.units ?? []),
    [selectedSubjectTree],
  );

  const visibleNodes = useMemo(
    () => filterStructureTreeNodesByTitleQuery(treeNodes, searchQuery),
    [treeNodes, searchQuery],
  );

  function handleSelectNode(structureUnitId: StructureUnitId): void {
    const node = findStructureTreeNodeById(treeNodes, structureUnitId);

    if (node !== null) {
      setSelectedNode({ title: node.title, structureTypeLabel: node.structureTypeLabel });
    }
  }

  function handleSelectSubject(subjectId: string): void {
    setSelectedSubjectId(subjectId);
    setSearchQuery("");
    setSelectedNode(null);
    setIsSubjectPickerOpen(false);
  }

  function handleRetry(): void {
    setHasLoadedOnce(false);
    setRetryCount((count) => count + 1);
  }

  return (
    <TabScreen
      activeDestination="subjects"
      header={
        <GlassSurface style={styles.headerGlass}>
          <SubjectHeaderRow
            subjectDisplayName={selectedSubjectTree?.subject.displayName ?? null}
            hasSubjects={subjects.length > 0}
            onOpenPicker={() => setIsSubjectPickerOpen(true)}
          />
        </GlassSurface>
      }
    >
      <NotesScreenBody
        isLoading={isLoadingToken || (!isSignedOut && !hasLoadedOnce)}
        isSignedOut={isSignedOut}
        errorMessage={errorMessage}
        onRetry={handleRetry}
        onSignIn={() => router.replace("/(auth)")}
        selectedSubjectTree={selectedSubjectTree}
        treeNodes={treeNodes}
        visibleNodes={visibleNodes}
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        selectedNode={selectedNode}
        onSelectNode={handleSelectNode}
      />

      {subjects.length > 0 ? (
        <SubjectPickerModal
          visible={isSubjectPickerOpen}
          subjects={subjects}
          selectedSubjectId={selectedSubjectTree?.subject.subjectId ?? null}
          onSelect={handleSelectSubject}
          onClose={() => setIsSubjectPickerOpen(false)}
        />
      ) : null}
    </TabScreen>
  );
}

function readSubjectsForActiveTerm(
  tree: AcademicApiStructureTree | null,
): readonly AcademicApiSubjectStructureTree[] {
  if (tree === null) {
    return [];
  }

  return findActiveTermStructureTree(tree)?.subjects ?? [];
}

function resolveSelectedSubjectTree(
  subjects: readonly AcademicApiSubjectStructureTree[],
  selectedSubjectId: string | null,
): AcademicApiSubjectStructureTree | null {
  const explicitSelection = subjects.find(
    (subjectTree) => subjectTree.subject.subjectId === selectedSubjectId,
  );

  return explicitSelection ?? subjects[0] ?? null;
}

function findStructureTreeNodeById(
  nodes: readonly StructureTreeNodeContract[],
  structureUnitId: StructureUnitId,
): StructureTreeNodeContract | null {
  for (const node of nodes) {
    if (node.structureUnitId === structureUnitId) {
      return node;
    }

    const foundInChildren = findStructureTreeNodeById(node.children, structureUnitId);

    if (foundInChildren !== null) {
      return foundInChildren;
    }
  }

  return null;
}

function buildNotesUnavailableMessage(selectedNode: SelectedStructureNode | null): string {
  if (selectedNode === null) {
    return "Notes aren't available on mobile yet. Check back soon.";
  }

  return `Notes for ${selectedNode.title} aren't available on mobile yet. Check back soon.`;
}

/**
 * The one place `NotesRoute`'s loading / error / no-subjects / loaded
 * branches live, kept out of the route component itself so each state stays
 * a single, easy-to-read path rather than a deeply nested conditional.
 */
function NotesScreenBody({
  isLoading,
  isSignedOut,
  errorMessage,
  onRetry,
  onSignIn,
  selectedSubjectTree,
  treeNodes,
  visibleNodes,
  searchQuery,
  onChangeSearchQuery,
  selectedNode,
  onSelectNode,
}: {
  isLoading: boolean;
  isSignedOut: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  onSignIn: () => void;
  selectedSubjectTree: AcademicApiSubjectStructureTree | null;
  treeNodes: readonly StructureTreeNodeContract[];
  visibleNodes: readonly StructureTreeNodeContract[];
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  selectedNode: SelectedStructureNode | null;
  onSelectNode: (structureUnitId: StructureUnitId) => void;
}): ReactElement {
  // A session that finished loading and is genuinely absent is a distinct,
  // terminal state — without this check the caller's data effect never
  // runs (its own guard clause returns immediately), `hasLoadedOnce` never
  // becomes true, and this screen would show its loading skeleton forever
  // instead of an honest, recoverable state.
  if (isSignedOut) {
    return (
      <ErrorState
        title="You're signed out"
        message="Sign in again to see your subjects."
        retryLabel="Sign in"
        onRetry={onSignIn}
        style={styles.errorState}
      />
    );
  }

  if (isLoading) {
    return <NotesScreenSkeleton />;
  }

  if (errorMessage !== null) {
    return (
      <ErrorState
        title="Couldn't load your subjects"
        message={errorMessage}
        onRetry={onRetry}
        style={styles.errorState}
      />
    );
  }

  if (selectedSubjectTree === null) {
    return (
      <Text variant="body" color="secondary" style={styles.noSubjectsMessage}>
        Add a subject to start organizing notes by your syllabus.
      </Text>
    );
  }

  return (
    <SubjectStructureSection
      subjectDisplayName={selectedSubjectTree.subject.displayName}
      treeNodes={treeNodes}
      visibleNodes={visibleNodes}
      searchQuery={searchQuery}
      onChangeSearchQuery={onChangeSearchQuery}
      onSelectNode={onSelectNode}
      notesUnavailableMessage={buildNotesUnavailableMessage(selectedNode)}
    />
  );
}

function SubjectStructureSection({
  subjectDisplayName,
  treeNodes,
  visibleNodes,
  searchQuery,
  onChangeSearchQuery,
  onSelectNode,
  notesUnavailableMessage,
}: {
  subjectDisplayName: string;
  treeNodes: readonly StructureTreeNodeContract[];
  visibleNodes: readonly StructureTreeNodeContract[];
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  onSelectNode: (structureUnitId: StructureUnitId) => void;
  notesUnavailableMessage: string;
}): ReactElement {
  return (
    <>
      {treeNodes.length > 0 ? (
        <StructureSearchBar
          value={searchQuery}
          onChangeText={onChangeSearchQuery}
          subjectDisplayName={subjectDisplayName}
        />
      ) : null}

      <View style={styles.structureSection}>
        <StructureList
          treeNodes={treeNodes}
          visibleNodes={visibleNodes}
          searchQuery={searchQuery}
          onSelectNode={onSelectNode}
        />
      </View>

      <NotesUnavailableCard message={notesUnavailableMessage} />
    </>
  );
}

function StructureList({
  treeNodes,
  visibleNodes,
  searchQuery,
  onSelectNode,
}: {
  treeNodes: readonly StructureTreeNodeContract[];
  visibleNodes: readonly StructureTreeNodeContract[];
  searchQuery: string;
  onSelectNode: (structureUnitId: StructureUnitId) => void;
}): ReactElement {
  if (treeNodes.length === 0) {
    return (
      <EmptyStructureCard
        icon={<NotebookText size={EMPTY_STATE_ICON_SIZE_DP} color={mobileTokens.accent.default} />}
        message="No structure added for this subject yet."
      />
    );
  }

  if (visibleNodes.length === 0) {
    return (
      <EmptyStructureCard
        icon={<SearchX size={EMPTY_STATE_ICON_SIZE_DP} color={mobileTokens.text.tertiary} />}
        message={`No structure titles match "${searchQuery.trim()}".`}
      />
    );
  }

  return (
    <>
      <Text variant="eyebrow" color="tertiary" style={styles.sectionLabel}>
        Structure
      </Text>
      <StructureTree nodes={visibleNodes} onSelectNode={onSelectNode} />
    </>
  );
}

function EmptyStructureCard({ icon, message }: { icon: ReactElement; message: string }): ReactElement {
  return (
    <View style={styles.emptyStructureCard}>
      <View style={styles.emptyStructureIconBadge}>{icon}</View>
      <Text variant="body" color="secondary" style={styles.emptyStructureText}>
        {message}
      </Text>
    </View>
  );
}

function StructureSearchBar({
  value,
  onChangeText,
  subjectDisplayName,
}: {
  value: string;
  onChangeText: (query: string) => void;
  subjectDisplayName: string;
}): ReactElement {
  return (
    <View style={styles.searchRow}>
      <Input
        icon={<Search size={SEARCH_ICON_SIZE_DP} color={mobileTokens.text.tertiary} />}
        value={value}
        onChangeText={onChangeText}
        placeholder={`Search ${subjectDisplayName} structure...`}
        style={styles.searchInput}
        returnKeyType="search"
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          onPress={() => onChangeText("")}
          style={({ pressed }) => [styles.clearButton, pressed && styles.clearButtonPressed]}
        >
          <X size={CLEAR_ICON_SIZE_DP} color={mobileTokens.text.tertiary} />
        </Pressable>
      ) : null}
    </View>
  );
}

function SubjectHeaderRow({
  subjectDisplayName,
  hasSubjects,
  onOpenPicker,
}: {
  subjectDisplayName: string | null;
  hasSubjects: boolean;
  onOpenPicker: () => void;
}): ReactElement {
  const canSwitchSubject = hasSubjects && subjectDisplayName !== null;

  return (
    <View style={styles.headerRow}>
      <View style={styles.headerIconBadge}>
        <NotebookText size={HEADER_ICON_SIZE_DP} color={mobileTokens.accent.default} />
        <View style={styles.headerIconBadgeDot} />
      </View>
      <View style={styles.headerTextBlock}>
        <Text variant="titleMd" color="primary">
          Notes
        </Text>
        {canSwitchSubject ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Switch subject"
            onPress={onOpenPicker}
            style={styles.subjectSwitcher}
          >
            <Text variant="body" color="secondary" numberOfLines={1} style={styles.subjectSwitcherLabel}>
              {subjectDisplayName}
            </Text>
            <ChevronDown size={CHEVRON_SIZE_DP} color={mobileTokens.text.tertiary} />
          </Pressable>
        ) : (
          <Text variant="body" color="tertiary">
            No subjects yet
          </Text>
        )}
      </View>
    </View>
  );
}

function NotesUnavailableCard({ message }: { message: string }): ReactElement {
  return (
    <Card variant="raised" style={styles.notesCard}>
      <View style={styles.notesCardIconBadge}>
        <NotebookText size={HEADER_ICON_SIZE_DP} color={mobileTokens.text.tertiary} />
      </View>
      <Text variant="titleSm" color="primary" style={styles.notesCardTitle}>
        No notes here yet
      </Text>
      <Text variant="body" color="secondary" style={styles.notesCardMessage}>
        {message}
      </Text>
    </Card>
  );
}

function SubjectPickerModal({
  visible,
  subjects,
  selectedSubjectId,
  onSelect,
  onClose,
}: {
  visible: boolean;
  subjects: readonly AcademicApiSubjectStructureTree[];
  selectedSubjectId: string | null;
  onSelect: (subjectId: string) => void;
  onClose: () => void;
}): ReactElement {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.modalContent}>
        <Text variant="titleMd" color="primary" style={styles.modalTitle}>
          Your subjects
        </Text>
        <FlatList
          data={subjects}
          keyExtractor={(subjectTree) => subjectTree.subject.subjectId}
          renderItem={({ item }) => (
            <SubjectPickerRow
              subjectTree={item}
              isSelected={item.subject.subjectId === selectedSubjectId}
              onSelect={() => onSelect(item.subject.subjectId)}
            />
          )}
          contentContainerStyle={styles.modalListContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </BottomSheet>
  );
}

function SubjectPickerRow({
  subjectTree,
  isSelected,
  onSelect,
}: {
  subjectTree: AcademicApiSubjectStructureTree;
  isSelected: boolean;
  onSelect: () => void;
}): ReactElement {
  const unitCount = countStructureUnitNodes(subjectTree.units);

  return (
    <Pressable accessibilityRole="button" onPress={onSelect}>
      <Card variant="raised" style={[styles.subjectRow, isSelected && styles.subjectRowSelected]}>
        <View style={styles.subjectRowTextBlock}>
          <Text variant="bodyLg" color="primary" numberOfLines={1}>
            {subjectTree.subject.displayName}
          </Text>
          <Text variant="caption" color="tertiary" style={styles.subjectRowMeta}>
            {[subjectTree.subject.subjectCode, `${unitCount} unit${unitCount === 1 ? "" : "s"}`]
              .filter((value) => value !== null)
              .join(" · ")}
          </Text>
        </View>
        {isSelected ? (
          <View style={styles.subjectRowCheck}>
            <Check size={CHECK_ICON_SIZE_DP} color={mobileTokens.surface.base} />
          </View>
        ) : null}
      </Card>
    </Pressable>
  );
}

function NotesScreenSkeleton(): ReactElement {
  return (
    <View style={styles.skeletonBlock}>
      <Skeleton width="100%" height={parseInt(mobileTokens.control.lg, 10)} />
      <Skeleton width="100%" height={parseInt(mobileTokens.control.lg, 10) * 2} />
      <Skeleton width="100%" height={parseInt(mobileTokens.control.lg, 10) * 2} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerGlass: {
    paddingHorizontal: parseInt(mobileTokens.space.md, 10),
    paddingVertical: parseInt(mobileTokens.space.md, 10),
    borderBottomWidth: parseInt(mobileTokens.layout.divider, 10),
    borderBottomColor: mobileTokens.border.subtle,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: parseInt(mobileTokens.space.md, 10),
  },
  headerIconBadge: {
    width: parseInt(mobileTokens.control.lg, 10),
    height: parseInt(mobileTokens.control.lg, 10),
    borderRadius: parseInt(mobileTokens.radius.lg, 10),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: mobileTokens.accent.subtle,
  },
  headerIconBadgeDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: parseInt(mobileTokens.space.sm, 10),
    height: parseInt(mobileTokens.space.sm, 10),
    borderRadius: parseInt(mobileTokens.radius.full, 10),
    backgroundColor: mobileTokens.accent.default,
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: mobileTokens.surface.overlay,
  },
  headerTextBlock: {
    flex: 1,
    gap: parseInt(mobileTokens.space.xs, 10),
  },
  subjectSwitcher: {
    flexDirection: "row",
    alignItems: "center",
    gap: parseInt(mobileTokens.space.xs, 10),
  },
  subjectSwitcherLabel: {
    flexShrink: 1,
  },
  noSubjectsMessage: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
  },
  errorState: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
    alignItems: "flex-start",
  },
  searchRow: {
    marginTop: parseInt(mobileTokens.space.lg, 10),
    position: "relative",
  },
  searchInput: {
    borderRadius: parseInt(mobileTokens.radius.full, 10),
    paddingRight: parseInt(mobileTokens.space.xxl, 10),
  },
  clearButton: {
    position: "absolute",
    right: parseInt(mobileTokens.space.sm, 10),
    top: (parseInt(mobileTokens.control.xl, 10) - CLEAR_BUTTON_SIZE_DP) / 2,
    width: CLEAR_BUTTON_SIZE_DP,
    height: CLEAR_BUTTON_SIZE_DP,
    borderRadius: parseInt(mobileTokens.radius.full, 10),
    backgroundColor: mobileTokens.surface.raised,
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonPressed: {
    opacity: parseFloat(mobileTokens.state.mutedOpacity),
  },
  structureSection: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
  },
  sectionLabel: {
    marginBottom: parseInt(mobileTokens.space.sm, 10),
  },
  emptyStructureCard: {
    marginTop: parseInt(mobileTokens.space.sm, 10),
    alignItems: "center",
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderStyle: "dashed",
    borderColor: mobileTokens.border.default,
    borderRadius: parseInt(mobileTokens.radius.lg, 10),
    padding: parseInt(mobileTokens.space.lg, 10),
  },
  emptyStructureIconBadge: {
    width: parseInt(mobileTokens.control.lg, 10),
    height: parseInt(mobileTokens.control.lg, 10),
    borderRadius: parseInt(mobileTokens.radius.full, 10),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: mobileTokens.accent.subtle,
  },
  emptyStructureText: {
    marginTop: parseInt(mobileTokens.space.sm, 10),
    textAlign: "center",
  },
  notesCard: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
    alignItems: "center",
  },
  notesCardIconBadge: {
    width: parseInt(mobileTokens.control.lg, 10),
    height: parseInt(mobileTokens.control.lg, 10),
    borderRadius: parseInt(mobileTokens.radius.full, 10),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: mobileTokens.surface.sunken,
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: mobileTokens.border.subtle,
  },
  notesCardTitle: {
    marginTop: parseInt(mobileTokens.space.md, 10),
    textAlign: "center",
  },
  notesCardMessage: {
    marginTop: parseInt(mobileTokens.space.xs, 10),
    textAlign: "center",
  },
  skeletonBlock: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
    gap: parseInt(mobileTokens.space.md, 10),
  },
  modalContent: {
    maxHeight: "72%",
  },
  modalTitle: {
    marginBottom: parseInt(mobileTokens.space.md, 10),
  },
  modalListContent: {
    gap: parseInt(mobileTokens.space.sm, 10),
    paddingBottom: parseInt(mobileTokens.space.xl, 10),
  },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: parseInt(mobileTokens.space.sm, 10),
  },
  subjectRowSelected: {
    borderColor: mobileTokens.accent.default,
    backgroundColor: mobileTokens.accent.subtle,
  },
  subjectRowTextBlock: {
    flex: 1,
    gap: parseInt(mobileTokens.space.xs, 10) / 2,
  },
  subjectRowMeta: {
    marginTop: parseInt(mobileTokens.space.xs, 10) / 2,
  },
  subjectRowCheck: {
    width: parseInt(mobileTokens.control.sm, 10),
    height: parseInt(mobileTokens.control.sm, 10),
    borderRadius: parseInt(mobileTokens.radius.full, 10),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: mobileTokens.accent.default,
  },
});
