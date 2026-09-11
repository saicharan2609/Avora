import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { View, StyleSheet } from "react-native";
import type { AcademicApiTerm } from "@avora/core/api/academic";
import { Button, Card, ErrorState, Skeleton, Text } from "@avora/ui-mobile/primitives";
import { mobileTokens } from "@avora/ui-mobile/tokens";

import { getAcademicClient, getAuthPort, getSecureSessionStore } from "../src/composition";
import { useAccessToken } from "../src/auth/useAccessToken";
import { TabScreen } from "../src/navigation/TabScreen";

/**
 * There is no student profile field (name/email/avatar) in `AuthSession` or
 * `AuthIdentity` today — only `studentId`. Rather than invent a display
 * name, this screen shows the one real identity-adjacent fact available
 * (the active enrolment context) and the one universally real action:
 * signing out.
 */
export default function ProfileRoute(): ReactElement {
  const router = useRouter();
  const { accessToken, isLoading: isLoadingToken, isSignedOut } = useAccessToken();
  const [activeTerm, setActiveTerm] = useState<AcademicApiTerm | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isSigningOut, setIsSigningOut] = useState(false);

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

        // Same "active, else first" resolution as /subjects and /notes, so a
        // student sees the same current-term context on every screen.
        const activeOrFirstTerm =
          response.tree.terms.find((entry) => entry.term.lifecycleState === "active")?.term ??
          response.tree.terms[0]?.term ??
          null;

        setActiveTerm(activeOrFirstTerm);
        setErrorMessage(null);
        setHasLoadedOnce(true);
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Could not load your enrolment.");
          setHasLoadedOnce(true);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [accessToken, retryCount]);

  async function handleSignOut(): Promise<void> {
    setIsSigningOut(true);

    try {
      await getAuthPort().signOut();
    } catch {
      // Sign-out is still honoured locally even if the network call fails —
      // an unreachable API must never trap a student inside their account.
    } finally {
      await getSecureSessionStore().clearSession();
      router.replace("/(auth)");
    }
  }

  const isLoading = isLoadingToken || (!isSignedOut && !hasLoadedOnce);

  return (
    <TabScreen activeDestination="profile">
      <Text variant="display" color="primary">
        Profile
      </Text>

      <ProfileEnrolmentSection
        isSignedOut={isSignedOut}
        isLoading={isLoading}
        errorMessage={errorMessage}
        activeTerm={activeTerm}
        onSignIn={() => router.replace("/(auth)")}
        onRetry={() => {
          setHasLoadedOnce(false);
          setRetryCount((count) => count + 1);
        }}
      />

      <View style={styles.signOutSection}>
        <Button
          title="Sign out"
          intent="neutral"
          size="lg"
          state={isSigningOut ? "loading" : "default"}
          onPress={handleSignOut}
        />
      </View>
    </TabScreen>
  );
}

function ProfileEnrolmentSection({
  isSignedOut,
  isLoading,
  errorMessage,
  activeTerm,
  onSignIn,
  onRetry,
}: {
  isSignedOut: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  activeTerm: AcademicApiTerm | null;
  onSignIn: () => void;
  onRetry: () => void;
}): ReactElement {
  if (isSignedOut) {
    return (
      <ErrorState
        title="You're signed out"
        message="Sign in again to see your enrolment."
        retryLabel="Sign in"
        onRetry={onSignIn}
        style={styles.errorState}
      />
    );
  }

  if (isLoading) {
    return (
      <View style={styles.card}>
        <Skeleton width="70%" height={parseInt(mobileTokens.type.titleMd.lineHeight, 10)} />
      </View>
    );
  }

  if (errorMessage !== null) {
    return (
      <ErrorState
        title="Couldn't load your enrolment"
        message={errorMessage}
        onRetry={onRetry}
        style={styles.errorState}
      />
    );
  }

  if (activeTerm === null) {
    return (
      <Text variant="body" color="secondary" style={styles.emptyState}>
        You haven't set up an enrolment yet.
      </Text>
    );
  }

  return (
    <Card variant="raised" style={styles.card}>
      <Text variant="eyebrow" color="tertiary">
        Current enrolment
      </Text>
      <Text variant="titleMd" color="primary" style={styles.termLabel}>
        {activeTerm.label}
      </Text>
      {activeTerm.institutionName !== null ? (
        <Text variant="body" color="secondary" style={styles.metaLine}>
          {activeTerm.institutionName}
        </Text>
      ) : null}
      {activeTerm.programmeName !== null || activeTerm.branchName !== null ? (
        <Text variant="caption" color="tertiary" style={styles.metaLine}>
          {[activeTerm.programmeName, activeTerm.branchName].filter((value) => value !== null).join(" · ")}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
  },
  termLabel: {
    marginTop: parseInt(mobileTokens.space.sm, 10),
  },
  metaLine: {
    marginTop: parseInt(mobileTokens.space.xs, 10),
  },
  emptyState: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
  },
  errorState: {
    marginTop: parseInt(mobileTokens.space.xl, 10),
    alignItems: "flex-start",
  },
  signOutSection: {
    marginTop: parseInt(mobileTokens.space.xxl, 10),
  },
});
