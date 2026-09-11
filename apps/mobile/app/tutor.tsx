import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, ArrowUp, Bot, Radar, X } from "lucide-react-native";

import type { AcademicApiSubject } from "@avora/core/api/academic";
import { BottomSheet, Card, ErrorState, GlassSurface, Skeleton, Text } from "@avora/ui-mobile/primitives";
import { mobileTokens } from "@avora/ui-mobile/tokens";

import { getAcademicClient } from "../src/composition";
import { useAccessToken } from "../src/auth/useAccessToken";

type ConversationEntry = Readonly<{
  id: string;
  role: "student" | "system";
  text: string;
  createdAtMs: number;
}>;

const HEADER_ICON_SIZE_DP = 18;
const SEND_ICON_SIZE_DP = 18;
const RADAR_ICON_SIZE_DP = 14;
const SENDER_ICON_SIZE_DP = 13;
const MODAL_CLOSE_ICON_SIZE_DP = 18;

const SUGGESTED_PROMPTS: readonly string[] = [
  "Explain this topic simply",
  "Summarize what I should know",
  "Quiz me on this subject",
  "What should I study next?",
];

type LoadSubjectsSetters = Readonly<{
  setSubjects: (subjects: readonly AcademicApiSubject[]) => void;
  setSelectedSubjectId: (updater: (current: string | null) => string | null) => void;
  setErrorMessage: (message: string | null) => void;
  setHasLoadedOnce: (value: boolean) => void;
}>;

// Extracted out of the effect body itself so TutorRoute's own function
// declaration stays a flat sequence of hook calls, not a nested tree of
// promise-chain branches.
function loadSubjects(accessToken: string | null, setters: LoadSubjectsSetters): (() => void) | undefined {
  if (accessToken === null) {
    return undefined;
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

      const foundSubjects = response.tree.terms.flatMap((term) => term.subjects.map((entry) => entry.subject));
      setters.setSubjects(foundSubjects);
      setters.setSelectedSubjectId((current) => resolveInitialSelectedSubjectId(current, foundSubjects));
      setters.setErrorMessage(null);
      setters.setHasLoadedOnce(true);
    })
    .catch((error: unknown) => {
      if (!isCancelled) {
        setters.setErrorMessage(error instanceof Error ? error.message : "Could not load your subjects.");
        setters.setHasLoadedOnce(true);
      }
    });

  return () => {
    isCancelled = true;
  };
}

function resolveInitialSelectedSubjectId(
  current: string | null,
  subjects: readonly AcademicApiSubject[],
): string | null {
  if (current !== null) {
    return current;
  }

  return subjects[0]?.subjectId ?? null;
}

/**
 * The tutor gateway (`TutorAnswerInvocationPort` / `/api/tutor/ask`) is real
 * and implemented server-side, but its route authenticates the request
 * against a web session cookie only (`apps/web/app/api/tutor/_shared/auth.ts`)
 * — unlike the academic setup routes, which also accept an
 * `Authorization: Bearer` header
 * (`apps/web/app/api/academic/_shared/academic-api-auth.ts`). Mobile has no
 * cookie jar; it authenticates every other call with a bearer token. Wiring
 * a real send action here would mean changing a protected auth boundary,
 * which is out of scope for a UI pass and needs its own reviewed decision.
 * Everything in this screen that can be real — subject scope, the
 * composer, the transcript of what the student actually typed — is real;
 * only the model's reply is an honest "not connected yet" state instead of
 * a fabricated answer.
 */
export default function TutorRoute(): ReactElement {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { accessToken, isLoading: isLoadingToken, isSignedOut } = useAccessToken();

  const [subjects, setSubjects] = useState<readonly AcademicApiSubject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);

  const [draftQuestion, setDraftQuestion] = useState("");
  const [conversation, setConversation] = useState<readonly ConversationEntry[]>([]);
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(
    () =>
      loadSubjects(accessToken, {
        setSubjects,
        setSelectedSubjectId,
        setErrorMessage,
        setHasLoadedOnce,
      }),
    [accessToken, retryCount],
  );

  const selectedSubject = subjects.find((subject) => subject.subjectId === selectedSubjectId) ?? null;
  const selectedSubjectDisplayName = selectedSubject?.displayName ?? null;
  const isLoading = isLoadingToken || (!isSignedOut && !hasLoadedOnce);

  function submitQuestion(question: string): void {
    const trimmed = question.trim();

    if (trimmed.length === 0) {
      return;
    }

    const now = Date.now();

    setConversation((current) => [
      ...current,
      { id: `student-${current.length}`, role: "student", text: trimmed, createdAtMs: now },
      {
        id: `system-${current.length}`,
        role: "system",
        text: "AI Tutor isn't connected on mobile yet. Your question is saved above — check back soon.",
        createdAtMs: now,
      },
    ]);
    setDraftQuestion("");
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 0);
  }

  return (
    <KeyboardAvoidingView
      style={styles.flexFill}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Header
        topInsetDp={insets.top}
        subjectName={selectedSubjectDisplayName}
        onBack={() => router.back()}
        onOpenScope={() => setIsScopeModalOpen(true)}
      />

      <ScrollView
        ref={scrollRef}
        style={styles.flexFill}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TutorBody
          isLoading={isLoading}
          isSignedOut={isSignedOut}
          errorMessage={errorMessage}
          conversation={conversation}
          subjectName={selectedSubjectDisplayName}
          onPickPrompt={setDraftQuestion}
          onRetry={() => {
            setHasLoadedOnce(false);
            setRetryCount((count) => count + 1);
          }}
          onSignIn={() => router.replace("/(auth)")}
        />
      </ScrollView>

      <Composer
        bottomInsetDp={insets.bottom}
        value={draftQuestion}
        onChangeText={setDraftQuestion}
        onSubmit={() => submitQuestion(draftQuestion)}
        subjectName={selectedSubjectDisplayName}
      />

      <ScopeModal
        visible={isScopeModalOpen}
        subjects={subjects}
        selectedSubjectId={selectedSubjectId}
        onSelect={(subjectId) => {
          setSelectedSubjectId(subjectId);
          setIsScopeModalOpen(false);
        }}
        onClose={() => setIsScopeModalOpen(false)}
      />
    </KeyboardAvoidingView>
  );
}

function TutorBody({
  isLoading,
  isSignedOut,
  errorMessage,
  conversation,
  subjectName,
  onPickPrompt,
  onRetry,
  onSignIn,
}: {
  isLoading: boolean;
  isSignedOut: boolean;
  errorMessage: string | null;
  conversation: readonly ConversationEntry[];
  subjectName: string | null;
  onPickPrompt: (prompt: string) => void;
  onRetry: () => void;
  onSignIn: () => void;
}): ReactElement {
  if (isSignedOut) {
    return (
      <ErrorState
        title="You're signed out"
        message="Sign in again to use the tutor."
        retryLabel="Sign in"
        onRetry={onSignIn}
        style={styles.errorState}
      />
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingBlock}>
        <Skeleton width="70%" height={parseInt(mobileTokens.type.titleMd.lineHeight, 10)} />
      </View>
    );
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

  if (conversation.length === 0) {
    return <WelcomeContent subjectName={subjectName} onPickPrompt={onPickPrompt} />;
  }

  return (
    <View style={styles.conversation}>
      {conversation.map((entry) => (
        <ConversationBubble key={entry.id} entry={entry} />
      ))}
    </View>
  );
}

function Header({
  topInsetDp,
  subjectName,
  onBack,
  onOpenScope,
}: {
  topInsetDp: number;
  subjectName: string | null;
  onBack: () => void;
  onOpenScope: () => void;
}): ReactElement {
  return (
    <GlassSurface style={[styles.header, { paddingTop: Math.max(topInsetDp, parseInt(mobileTokens.space.md, 10)) + parseInt(mobileTokens.space.md, 10) }]}>
      <View style={styles.headerTopRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          hitSlop={parseInt(mobileTokens.space.sm, 10)}
          style={({ pressed }) => [styles.headerIconButton, pressed && styles.pressed]}
        >
          <ArrowLeft size={HEADER_ICON_SIZE_DP} color={mobileTokens.text.primary} />
        </Pressable>

        <View style={styles.avatarBadge}>
          <Bot size={HEADER_ICON_SIZE_DP} color={mobileTokens.surface.base} />
        </View>

        <View style={styles.headerTitleBlock}>
          <Text variant="titleMd" color="primary">
            AI Tutor
          </Text>
          <Text variant="caption" color="tertiary" numberOfLines={1}>
            {subjectName ?? "No subject selected"}
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onOpenScope}
        style={({ pressed }) => [styles.scopePill, pressed && styles.pressed]}
      >
        <Radar size={RADAR_ICON_SIZE_DP} color={mobileTokens.accent.default} />
        <Text variant="caption" color="secondary" style={styles.scopePillText} numberOfLines={1}>
          {subjectName !== null ? `Studying: ${subjectName}` : "Choose a subject to study"}
        </Text>
      </Pressable>
    </GlassSurface>
  );
}

function WelcomeContent({
  subjectName,
  onPickPrompt,
}: {
  subjectName: string | null;
  onPickPrompt: (prompt: string) => void;
}): ReactElement {
  return (
    <View>
      <Card variant="raised" style={styles.welcomeCard}>
        <Text variant="eyebrow" color="tertiary">
          Ask about {subjectName ?? "your subject"}
        </Text>
        <Text variant="titleMd" color="primary" style={styles.welcomeTitle}>
          What do you want to work through?
        </Text>
        <Text variant="body" color="secondary" style={styles.welcomeBody}>
          AI Tutor answers aren't available on mobile yet — you can still write out your question below and it'll
          be saved for when the connection is ready.
        </Text>
      </Card>

      <Text variant="label" color="tertiary" style={styles.suggestedHeading}>
        Try asking
      </Text>
      <View style={styles.suggestedGrid}>
        {SUGGESTED_PROMPTS.map((prompt) => (
          <Pressable
            key={prompt}
            accessibilityRole="button"
            onPress={() => onPickPrompt(prompt)}
            style={({ pressed }) => [styles.suggestedChip, pressed && styles.pressed]}
          >
            <Text variant="label" color="primary" numberOfLines={2}>
              {prompt}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function formatBubbleTimestamp(createdAtMs: number): string {
  return new Date(createdAtMs).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function ConversationBubble({ entry }: { entry: ConversationEntry }): ReactElement {
  if (entry.role === "student") {
    return (
      <View style={styles.studentBubbleRow}>
        <View style={styles.studentBubble}>
          <Text variant="body" color="primary">
            {entry.text}
          </Text>
        </View>
        <Text variant="caption" color="tertiary" style={styles.studentTimestamp}>
          {formatBubbleTimestamp(entry.createdAtMs)}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.systemBubbleRow}>
      <View style={styles.systemSenderRow}>
        <Bot size={SENDER_ICON_SIZE_DP} color={mobileTokens.accent.default} />
        <Text variant="caption" color="tertiary">Avora Tutor</Text>
        <Text variant="caption" color="tertiary">·</Text>
        <Text variant="caption" color="tertiary">{formatBubbleTimestamp(entry.createdAtMs)}</Text>
      </View>
      <Card variant="base" style={styles.systemBubble}>
        <Text variant="body" color="secondary">
          {entry.text}
        </Text>
      </Card>
    </View>
  );
}

function Composer({
  bottomInsetDp,
  value,
  onChangeText,
  onSubmit,
  subjectName,
}: {
  bottomInsetDp: number;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  subjectName: string | null;
}): ReactElement {
  const canSubmit = value.trim().length > 0;

  return (
    <GlassSurface style={[styles.composerWrapper, { paddingBottom: Math.max(bottomInsetDp, parseInt(mobileTokens.space.sm, 10)) + parseInt(mobileTokens.space.sm, 10) }]}>
      <View style={styles.composerRow}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={subjectName !== null ? `Ask about ${subjectName}...` : "Ask anything..."}
          placeholderTextColor={mobileTokens.text.disabled}
          style={styles.composerInput}
          multiline
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send"
          disabled={!canSubmit}
          onPress={onSubmit}
          style={({ pressed }) => [
            styles.sendButton,
            !canSubmit && styles.sendButtonDisabled,
            pressed && canSubmit && styles.pressed,
          ]}
        >
          <ArrowUp size={SEND_ICON_SIZE_DP} color={mobileTokens.surface.base} />
        </Pressable>
      </View>
    </GlassSurface>
  );
}

function ScopeModal({
  visible,
  subjects,
  selectedSubjectId,
  onSelect,
  onClose,
}: {
  visible: boolean;
  subjects: readonly AcademicApiSubject[];
  selectedSubjectId: string | null;
  onSelect: (subjectId: string) => void;
  onClose: () => void;
}): ReactElement {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.modalHeader}>
        <Text variant="titleSm" color="primary">
          Choose a subject
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={parseInt(mobileTokens.space.sm, 10)}>
          <X size={MODAL_CLOSE_ICON_SIZE_DP} color={mobileTokens.text.tertiary} />
        </Pressable>
      </View>

      {subjects.length === 0 ? (
        <Text variant="body" color="secondary" style={styles.modalEmpty}>
          No subjects yet.
        </Text>
      ) : (
        subjects.map((subject) => (
          <Pressable
            key={subject.subjectId}
            accessibilityRole="button"
            onPress={() => onSelect(subject.subjectId)}
            style={({ pressed }) => [
              styles.modalRow,
              subject.subjectId === selectedSubjectId && styles.modalRowSelected,
              pressed && styles.pressed,
            ]}
          >
            <Text variant="body" color="primary">
              {subject.displayName}
            </Text>
          </Pressable>
        ))
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  flexFill: {
    flex: 1,
    backgroundColor: mobileTokens.surface.base,
  },
  pressed: {
    opacity: parseFloat(mobileTokens.state.mutedOpacity),
  },
  header: {
    paddingHorizontal: parseInt(mobileTokens.space.md, 10),
    paddingBottom: parseInt(mobileTokens.space.md, 10),
    borderBottomWidth: parseInt(mobileTokens.layout.divider, 10),
    borderBottomColor: mobileTokens.border.subtle,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: parseInt(mobileTokens.space.md, 10),
  },
  headerIconButton: {
    width: parseInt(mobileTokens.control.md, 10),
    height: parseInt(mobileTokens.control.md, 10),
    borderRadius: parseInt(mobileTokens.radius.lg, 10),
    backgroundColor: mobileTokens.surface.raised,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBadge: {
    width: parseInt(mobileTokens.control.md, 10),
    height: parseInt(mobileTokens.control.md, 10),
    borderRadius: parseInt(mobileTokens.radius.md, 10),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: mobileTokens.accent.default,
  },
  headerTitleBlock: {
    flex: 1,
  },
  scopePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: parseInt(mobileTokens.space.sm, 10),
    marginTop: parseInt(mobileTokens.space.md, 10),
    borderRadius: parseInt(mobileTokens.radius.full, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: mobileTokens.border.subtle,
    backgroundColor: mobileTokens.surface.raised,
    paddingHorizontal: parseInt(mobileTokens.space.md, 10),
    paddingVertical: parseInt(mobileTokens.space.sm, 10),
  },
  scopePillText: {
    flex: 1,
  },
  scrollContent: {
    padding: parseInt(mobileTokens.space.md, 10),
  },
  loadingBlock: {
    marginTop: parseInt(mobileTokens.space.lg, 10),
  },
  errorState: {
    marginTop: parseInt(mobileTokens.space.lg, 10),
    alignItems: "flex-start",
  },
  welcomeCard: {},
  welcomeTitle: {
    marginTop: parseInt(mobileTokens.space.sm, 10),
  },
  welcomeBody: {
    marginTop: parseInt(mobileTokens.space.sm, 10),
  },
  suggestedHeading: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
    marginBottom: parseInt(mobileTokens.space.sm, 10),
  },
  suggestedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: parseInt(mobileTokens.space.sm, 10),
  },
  suggestedChip: {
    flexBasis: "47%",
    flexGrow: 1,
    borderRadius: parseInt(mobileTokens.radius.lg, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: mobileTokens.border.subtle,
    backgroundColor: mobileTokens.surface.raised,
    padding: parseInt(mobileTokens.space.md, 10),
  },
  conversation: {
    gap: parseInt(mobileTokens.space.md, 10),
  },
  studentBubbleRow: {
    alignItems: "flex-end",
  },
  studentBubble: {
    maxWidth: "85%",
    borderRadius: parseInt(mobileTokens.radius.lg, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: mobileTokens.accent.subtle,
    backgroundColor: mobileTokens.accent.subtle,
    paddingHorizontal: parseInt(mobileTokens.space.md, 10),
    paddingVertical: parseInt(mobileTokens.space.sm, 10),
  },
  studentTimestamp: {
    marginTop: parseInt(mobileTokens.space.xs, 10) / 2,
  },
  systemBubbleRow: {
    alignItems: "flex-start",
  },
  systemSenderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: parseInt(mobileTokens.space.xs, 10),
    marginBottom: parseInt(mobileTokens.space.xs, 10),
  },
  systemBubble: {
    maxWidth: "90%",
  },
  composerWrapper: {
    borderTopWidth: parseInt(mobileTokens.layout.divider, 10),
    borderTopColor: mobileTokens.border.subtle,
    padding: parseInt(mobileTokens.space.sm, 10),
  },
  composerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: parseInt(mobileTokens.space.sm, 10),
    borderRadius: parseInt(mobileTokens.radius.xl, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: mobileTokens.border.default,
    backgroundColor: mobileTokens.surface.raised,
    padding: parseInt(mobileTokens.space.xs, 10) * 2,
  },
  composerInput: {
    flex: 1,
    maxHeight: 120,
    color: mobileTokens.text.primary,
    fontSize: parseInt(mobileTokens.type.body.size, 10),
    paddingHorizontal: parseInt(mobileTokens.space.sm, 10),
    paddingVertical: parseInt(mobileTokens.space.sm, 10),
  },
  sendButton: {
    width: parseInt(mobileTokens.control.md, 10),
    height: parseInt(mobileTokens.control.md, 10),
    borderRadius: parseInt(mobileTokens.radius.full, 10),
    backgroundColor: mobileTokens.accent.default,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: parseFloat(mobileTokens.state.disabledOpacity),
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: parseInt(mobileTokens.space.md, 10),
  },
  modalEmpty: {
    paddingVertical: parseInt(mobileTokens.space.lg, 10),
  },
  modalRow: {
    borderRadius: parseInt(mobileTokens.radius.md, 10),
    paddingHorizontal: parseInt(mobileTokens.space.md, 10),
    paddingVertical: parseInt(mobileTokens.space.md, 10),
  },
  modalRowSelected: {
    backgroundColor: mobileTokens.accent.subtle,
  },
});
