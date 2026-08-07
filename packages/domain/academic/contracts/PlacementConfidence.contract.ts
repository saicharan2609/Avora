export const placementConfidenceLevels = [
  "student_confirmed",
  "high",
  "medium",
  "low",
  "unknown",
] as const;

export type PlacementConfidenceLevel =
  (typeof placementConfidenceLevels)[number];

export const placementConfidenceSources = [
  "student",
  "imported",
  "system_suggested",
] as const;

export type PlacementConfidenceSource =
  (typeof placementConfidenceSources)[number];

export type PlacementConfidence = Readonly<{
  level: PlacementConfidenceLevel;
  source: PlacementConfidenceSource;
  reason: string | null;
}>;