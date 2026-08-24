import type {
  ExtractedPage,
  ExtractionProvenance,
  ResourceExtractedContentBlock,
  ResourceExtractedContentBlockId,
  ResourceExtractedContentBlockKind,
  ResourceExtractedPageId,
  ResourceExtractionDocumentId,
  ResourceExtractionStrategyVersion,
  ResourceSourceLocator,
} from "@avora/domain/resources";

import { sanitizeExtractedText } from "../sanitization/ResourceTextSanitizer.js";

export type RawPdfPageInput = Readonly<{
  pageNumber: number;
  text: string;
}>;

export type ParsedPdfStructure = Readonly<{
  pages: readonly ExtractedPage[];
  blocks: readonly ResourceExtractedContentBlock[];
}>;

export type ParsePdfStructureInput = Readonly<{
  extractionDocumentId: ResourceExtractionDocumentId;
  rawPages: readonly RawPdfPageInput[];
  provenance: ExtractionProvenance;
  strategyVersion: ResourceExtractionStrategyVersion;
}>;

const HEADING_PATTERNS = [
  // Markdown style: # Heading, ## Subheading
  /^#{1,6}\s+(.+)$/,
  // Academic syllabus patterns: Section 1, Part 2, Experiment 3, Lab 4
  /^(?:section|part|experiment|lab|overview|concept)\s+[0-9IVXLCDM]+[:.\s-]+(.+)$/i,
  // Numbered headings: 1. Introduction, 2.1 Database Architecture
  /^[0-9]+(?:\.[0-9]+)*\s+[A-Z][A-Za-z0-9\s,–—:-]{2,80}$/,
  // All-caps short standalone titles (e.g. "RELATIONAL ALGEBRA")
  /^[A-Z0-9\s,–—:-]{3,60}$/,
];

const LIST_PATTERNS = [
  /^[\s]*[•\-*]\s+(.+)$/,
  /^[\s]*[0-9]+[.)]\s+(.+)$/,
  /^[\s]*[a-zA-Z][.)]\s+(.+)$/,
  /^[\s]*[ivxlcdm]+[.)]\s+(.+)$/i,
];

const FORMULA_PATTERNS = [
  /\\(?:frac|sum|int|prod|sqrt|alpha|beta|gamma|delta|theta|sigma|omega|pi|infty|partial|nabla|times|cdot|le|ge|neq|approx|equiv)\b/,
  /\$\$?[^$]+\$\$?/,
  /\\\[.*?\\\]/,
  /\\\(.*?\\\)/,
];

const CODE_KEYWORDS = [
  "select ",
  "create table ",
  "insert into ",
  "update ",
  "delete from ",
  "function ",
  "class ",
  "const ",
  "let ",
  "var ",
  "def ",
  "public class ",
  "import ",
  "export ",
  "void ",
  "int ",
  "return ",
  "struct ",
  "#include ",
];

export function parsePdfStructure(
  input: ParsePdfStructureInput,
): ParsedPdfStructure {
  const extractedPages: ExtractedPage[] = [];
  const extractedBlocks: ResourceExtractedContentBlock[] = [];
  let globalSortOrder = 1;

  for (const rawPage of input.rawPages) {
    const pageLocator: ResourceSourceLocator = {
      kind: "document_page",
      pageNumber: rawPage.pageNumber,
      slideNumber: null,
      boundingBox: null,
      textSpan: {
        startOffset: 0,
        endOffset: rawPage.text.length,
      },
      timeRange: null,
      label: `Page ${rawPage.pageNumber}`,
    };

    const sanitizedPageText = sanitizeExtractedText(rawPage.text);
    const pageBlocks = parsePageBlocks({
      extractionDocumentId: input.extractionDocumentId,
      pageNumber: rawPage.pageNumber,
      pageText: sanitizedPageText,
      startSortOrder: globalSortOrder,
    });

    globalSortOrder += pageBlocks.length;
    extractedBlocks.push(...pageBlocks);

    const pageId =
      `${input.extractionDocumentId}-page-${rawPage.pageNumber}` as ResourceExtractedPageId;

    extractedPages.push({
      pageId,
      pageNumber: rawPage.pageNumber,
      text: sanitizedPageText,
      locator: pageLocator,
      confidence: sanitizedPageText.length > 0 ? 0.98 : null,
      provenance: input.provenance,
      failure: null,
    });
  }

  return {
    pages: extractedPages,
    blocks: extractedBlocks,
  };
}

function parsePageBlocks(input: {
  extractionDocumentId: ResourceExtractionDocumentId;
  pageNumber: number;
  pageText: string;
  startSortOrder: number;
}): readonly ResourceExtractedContentBlock[] {
  if (input.pageText.trim().length === 0) {
    return [];
  }

  const rawParagraphs = input.pageText.split(/\n\s*\n+/);
  const blocks: ResourceExtractedContentBlock[] = [];
  let currentSortOrder = input.startSortOrder;
  let charOffset = 0;

  for (const rawParagraph of rawParagraphs) {
    const trimmed = rawParagraph.trim();

    if (trimmed.length === 0) {
      charOffset += rawParagraph.length;
      continue;
    }

    const kind = classifyBlockKind(trimmed);
    const blockId =
      `${input.extractionDocumentId}-b${input.pageNumber}-${currentSortOrder}` as ResourceExtractedContentBlockId;

    const blockLocator: ResourceSourceLocator = {
      kind: "document_page",
      pageNumber: input.pageNumber,
      slideNumber: null,
      boundingBox: null,
      textSpan: {
        startOffset: charOffset,
        endOffset: charOffset + rawParagraph.length,
      },
      timeRange: null,
      label: `Page ${input.pageNumber}, Block ${currentSortOrder}`,
    };

    blocks.push({
      blockId,
      kind,
      text: trimmed,
      locator: blockLocator,
      sortOrder: currentSortOrder,
      parentBlockId: null,
      confidence: 0.98,
    });

    currentSortOrder += 1;
    charOffset += rawParagraph.length;
  }

  return blocks;
}

function isTableBlock(text: string): boolean {
  return (
    text.includes("|") &&
    text.split("\n").filter((l) => l.includes("|")).length >= 2
  );
}

function isFormulaBlock(text: string): boolean {
  for (const pattern of FORMULA_PATTERNS) {
    if (pattern.test(text)) {
      return true;
    }
  }
  return false;
}

function isListBlock(text: string): boolean {
  const lines = text.split("\n");
  const listMatches = lines.filter((line) =>
    LIST_PATTERNS.some((p) => p.test(line.trim())),
  );
  return listMatches.length >= 1 && listMatches.length >= lines.length / 2;
}

function isHeadingBlock(text: string): boolean {
  const lines = text.split("\n");
  return lines.length <= 2 && HEADING_PATTERNS.some((p) => p.test(text.trim()));
}

function isCodeSnippet(text: string): boolean {
  const lower = text.toLowerCase();
  let matches = 0;

  for (const keyword of CODE_KEYWORDS) {
    if (lower.includes(keyword)) {
      matches += 1;
    }
  }

  return (
    matches >= 2 ||
    (matches >= 1 &&
      (text.includes("{") || text.includes("}") || text.includes(";")))
  );
}

function classifyBlockKind(text: string): ResourceExtractedContentBlockKind {
  if (isTableBlock(text)) {
    return "table";
  }

  if (isFormulaBlock(text)) {
    return "formula";
  }

  if (text.startsWith("```") || isCodeSnippet(text)) {
    return "code";
  }

  if (isListBlock(text)) {
    return "list";
  }

  if (isHeadingBlock(text)) {
    return "heading";
  }

  return "paragraph";
}
