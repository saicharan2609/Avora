import type {
  ResourceExtractedContentBlockId,
} from "./ResourceExtractionIdentifiers.contract.js";
import type {
  ResourceSourceLocator,
} from "./ResourceSourceLocator.contract.js";

export const resourceExtractedContentBlockKinds = [
  "heading",
  "paragraph",
  "list",
  "table",
  "formula",
  "code",
  "figure",
  "diagram",
  "transcript",
  "metadata",
  "unknown",
] as const;

export type ResourceExtractedContentBlockKind =
  (typeof resourceExtractedContentBlockKinds)[number];

export type ResourceExtractedContentBlock = Readonly<{
  blockId: ResourceExtractedContentBlockId;
  kind: ResourceExtractedContentBlockKind;
  text: string;
  locator: ResourceSourceLocator;
  sortOrder: number;
  parentBlockId: ResourceExtractedContentBlockId | null;
  confidence: number | null;
}>;