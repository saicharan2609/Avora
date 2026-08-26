export const summaryOutputContractVersion =
  "summary-output-contract.v1" as const;

export type SummaryOutputContractVersion =
  typeof summaryOutputContractVersion;

export type SummaryRawCitation = Readonly<{
  chunkId: string;
  quote: string;
}>;

export type SummaryRawHeading = Readonly<{
  title: string;
  points: readonly string[];
}>;

export type SummaryRawOutput = Readonly<{
  headings: readonly SummaryRawHeading[];
  citations: readonly SummaryRawCitation[];
}>;

export type SummaryOutputContractValidationResult =
  | Readonly<{
      valid: true;
      value: SummaryRawOutput;
    }>
  | Readonly<{
      valid: false;
      issues: readonly string[];
    }>;

export function validateSummaryRawOutput(
  raw: unknown,
): SummaryOutputContractValidationResult {
  if (!isRecord(raw)) {
    return {
      valid: false,
      issues: ["Model output was not a JSON object."],
    };
  }

  const issues: string[] = [
    ...collectFieldIssues(raw["headings"], "headings", isPlausibleRawHeading),
    ...collectFieldIssues(raw["citations"], "citations", isPlausibleRawCitation),
  ];

  const rawHeadings = raw["headings"];
  const rawCitations = raw["citations"];

  if (
    issues.length > 0 ||
    !isUnknownArray(rawHeadings) ||
    !isUnknownArray(rawCitations)
  ) {
    return {
      valid: false,
      issues,
    };
  }

  return {
    valid: true,
    value: {
      headings: rawHeadings.filter(isPlausibleRawHeading),
      citations: rawCitations.filter(isPlausibleRawCitation),
    },
  };
}

function collectFieldIssues<T>(
  value: unknown,
  fieldName: string,
  isPlausibleEntry: (entry: unknown) => entry is T,
): readonly string[] {
  if (!isUnknownArray(value)) {
    return [`Model output field "${fieldName}" was not an array.`];
  }

  const issues: string[] = [];

  value.forEach((entry, index) => {
    if (!isPlausibleEntry(entry)) {
      issues.push(
        `Model output entry in "${fieldName}" at index ${index} did not match the required shape.`,
      );
    }
  });

  return issues;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUnknownArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

function isPlausibleRawCitation(
  entry: unknown,
): entry is SummaryRawCitation {
  if (!isRecord(entry)) {
    return false;
  }

  return (
    typeof entry["chunkId"] === "string" &&
    entry["chunkId"].trim().length > 0 &&
    typeof entry["quote"] === "string"
  );
}

function isPlausibleRawHeading(
  entry: unknown,
): entry is SummaryRawHeading {
  if (!isRecord(entry)) {
    return false;
  }

  if (typeof entry["title"] !== "string" || entry["title"].trim().length === 0) {
    return false;
  }

  const points = entry["points"];

  return (
    Array.isArray(points) &&
    points.length > 0 &&
    points.every((point) => typeof point === "string")
  );
}
