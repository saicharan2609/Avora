import { createContext, useContext, useMemo, useState } from "react";
import type { ReactElement, ReactNode } from "react";

export type OnboardingDraftSubject = Readonly<{
  subjectId: string;
  displayName: string;
}>;

export type OnboardingDraft = Readonly<{
  institutionName: string | null;
  programmeName: string | null;
  branchName: string | null;
  // The student's own raw picks (Year 1-4, Semester 1-2 within that year) —
  // preserved separately from the resolved `termLabel` sent to the API, so a
  // later step can read back exactly what the student chose.
  currentYearNumber: number | null;
  semesterWithinYearNumber: number | null;
  termLabel: string | null;
  termId: string | null;
  subjects: readonly OnboardingDraftSubject[];
}>;

export type OnboardingContextValue = Readonly<{
  draft: OnboardingDraft;
  updateDraft: (patch: Partial<OnboardingDraft>) => void;
}>;

const emptyDraft: OnboardingDraft = {
  institutionName: null,
  programmeName: null,
  branchName: null,
  currentYearNumber: null,
  semesterWithinYearNumber: null,
  termLabel: null,
  termId: null,
  subjects: [],
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: Readonly<{ children: ReactNode }>): ReactElement {
  const [draft, setDraft] = useState<OnboardingDraft>(emptyDraft);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      draft,
      updateDraft: (patch: Partial<OnboardingDraft>) => {
        setDraft((current) => ({ ...current, ...patch }));
      },
    }),
    [draft],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboardingDraft(): OnboardingContextValue {
  const value = useContext(OnboardingContext);

  if (value === null) {
    throw new Error("useOnboardingDraft must be used within an OnboardingProvider.");
  }

  return value;
}
