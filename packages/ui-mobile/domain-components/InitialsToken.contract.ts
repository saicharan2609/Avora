export type InitialsTokenContract = Readonly<{
  label: string;
  active?: boolean;
  // "squircle" reproduces the reference's rounded-square subject-card badge
  // (always accent-tinted, monospace label) — "circle" is the selection-row
  // avatar chip used elsewhere in onboarding.
  shape?: "circle" | "squircle";
}>;
