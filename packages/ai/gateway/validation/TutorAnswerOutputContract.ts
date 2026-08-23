export const tutorAnswerOutputContractVersion =
  "tutor-answer-output-contract.v1" as const;

export type TutorAnswerOutputContractVersion =
  typeof tutorAnswerOutputContractVersion;

export type TutorAnswerRawCitation = Readonly<{
  chunkId: string;
  quote: string;
}>;

export type TutorAnswerRawOutput = Readonly<{
  answerText: string;
  citations: readonly TutorAnswerRawCitation[];
}>;

export type TutorAnswerOutputContractValidationResult =
  | Readonly<{
      valid: true;
      value: TutorAnswerRawOutput;
    }>
  | Readonly<{
      valid: false;
      issues: readonly string[];
    }>;

export function validateTutorAnswerRawOutput(
  raw: unknown,
): TutorAnswerOutputContractValidationResult {
  if (!isRecord(raw)) {
    return {
      valid: false,
      issues: ["Model output was not a JSON object."],
    };
  }

  const issues: string[] = [];

  if (typeof raw["answerText"] !== "string") {
    issues.push("Model output field \"answerText\" was not a string.");
  }

  if (!isUnknownArray(raw["citations"])) {
    issues.push("Model output field \"citations\" was not an array.");
  } else {
    raw["citations"].forEach((entry, index) => {
      if (!isPlausibleRawCitation(entry)) {
        issues.push(
          `Model output citation at index ${index} did not match the required shape.`,
        );
      }
    });
  }

  const answerText = raw["answerText"];
  const rawCitations = raw["citations"];

  if (
    issues.length > 0 ||
    typeof answerText !== "string" ||
    !isUnknownArray(rawCitations)
  ) {
    return {
      valid: false,
      issues,
    };
  }

  const citations: TutorAnswerRawCitation[] = [];

  for (const entry of rawCitations) {
    if (isPlausibleRawCitation(entry)) {
      citations.push(entry);
    }
  }

  return {
    valid: true,
    value: {
      answerText,
      citations,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUnknownArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

function isPlausibleRawCitation(
  entry: unknown,
): entry is TutorAnswerRawCitation {
  if (!isRecord(entry)) {
    return false;
  }

  return (
    typeof entry["chunkId"] === "string" &&
    entry["chunkId"].trim().length > 0 &&
    typeof entry["quote"] === "string"
  );
}
