import type {
  ResourceExtractedContentBlock,
  ResourceExtractedContentBlockId,
} from "@avora/domain/resources";

import {
  MAXIMUM_BLOCK_TEXT_LENGTH,
  sanitizeExtractedContentBlocks,
  sanitizeExtractedText,
} from "../sanitization/ResourceTextSanitizer.js";

class ResourceTextSanitizerTestFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "ResourceTextSanitizerTestFailure";
  }
}

function assert(
  condition: boolean,
  caseId: string,
  reason: string,
): asserts condition {
  if (!condition) {
    throw new ResourceTextSanitizerTestFailure(caseId, reason);
  }
}

async function runStripsDangerousScriptTagsCase(): Promise<void> {
  const caseId = "sanitizer-strips-dangerous-scripts";
  const malicious = `
    Hello student!
    <script>alert('pwned')</script>
    Here is the lecture note.
    <iframe src="https://evil.com"></iframe>
    <object data="malware.exe"></object>
  `;

  const sanitized = sanitizeExtractedText(malicious);

  assert(!sanitized.includes("<script>"), caseId, "must not contain <script>");
  assert(
    !sanitized.includes("alert('pwned')"),
    caseId,
    "must not contain script payload",
  );
  assert(!sanitized.includes("<iframe"), caseId, "must not contain <iframe");
  assert(!sanitized.includes("<object"), caseId, "must not contain <object");
  assert(
    sanitized.includes("Hello student!"),
    caseId,
    "must preserve clean text",
  );
  assert(
    sanitized.includes("Here is the lecture note."),
    caseId,
    "must preserve body text",
  );
}

async function runStripsInlineEventHandlersCase(): Promise<void> {
  const caseId = "sanitizer-strips-inline-event-handlers";
  const attack = `<img src="x" onerror="alert(1)" /> Click <a href="javascript:steal()">here</a>`;
  const sanitized = sanitizeExtractedText(attack);

  assert(
    !sanitized.includes("onerror"),
    caseId,
    "must not contain onerror attribute",
  );
  assert(
    !sanitized.includes("javascript:"),
    caseId,
    "must not contain javascript: scheme",
  );
}

async function runStripsNullBytesAndControlCharactersCase(): Promise<void> {
  const caseId = "sanitizer-strips-null-bytes-control-chars";
  const dirty = "Topic 1:\0Introduction\x08 to Databases\x1B[31m";
  const sanitized = sanitizeExtractedText(dirty);

  assert(
    sanitized === "Topic 1:Introduction to Databases",
    caseId,
    `expected cleaned text but got '${sanitized}'`,
  );
}

async function runNormalizesUnicodeHomoglyphsCase(): Promise<void> {
  const caseId = "sanitizer-normalizes-unicode-homoglyphs";
  const fullwidth = "Ｄａｔａｂａｓｅ\r\nＣｏｎｃｅｐｔｓ";
  const sanitized = sanitizeExtractedText(fullwidth);

  assert(
    sanitized === "Database\nConcepts",
    caseId,
    `expected normalized Latin text but got '${sanitized}'`,
  );
}

async function runPreservesLatexFormulasCase(): Promise<void> {
  const caseId = "sanitizer-preserves-latex-formulas";
  const math =
    "Quadratic formula: \\( x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} \\)";
  const sanitized = sanitizeExtractedText(math);

  assert(
    sanitized === math,
    caseId,
    "must preserve LaTeX mathematical expressions",
  );
}

async function runPreservesCodeAndTablesCase(): Promise<void> {
  const caseId = "sanitizer-preserves-code-and-tables";
  const sql =
    "SELECT student_id, name FROM students WHERE gpa >= 3.5 ORDER BY name ASC;";
  assert(
    sanitizeExtractedText(sql) === sql,
    caseId,
    "must preserve SQL queries",
  );

  const table = `| Subject | Code | Credits |\n| :--- | :--- | :--- |\n| OS | CS3401 | 4 |`;
  assert(
    sanitizeExtractedText(table) === table,
    caseId,
    "must preserve markdown tables",
  );
}

async function runEnforcesBlockBudgetCase(): Promise<void> {
  const caseId = "sanitizer-enforces-block-budget";
  const huge = "A".repeat(MAXIMUM_BLOCK_TEXT_LENGTH + 500);
  const sanitized = sanitizeExtractedText(huge);

  assert(
    sanitized.length === MAXIMUM_BLOCK_TEXT_LENGTH,
    caseId,
    `expected block length bounded to ${MAXIMUM_BLOCK_TEXT_LENGTH} but got ${sanitized.length}`,
  );
}

async function runSanitizesBlockArrayCase(): Promise<void> {
  const caseId = "sanitizer-sanitizes-block-array";
  const blockId1 = "b-1" as ResourceExtractedContentBlockId;
  const blockId2 = "b-2" as ResourceExtractedContentBlockId;

  const blocks: ResourceExtractedContentBlock[] = [
    {
      blockId: blockId1,
      kind: "paragraph",
      text: "Valid content",
      locator: {
        kind: "document_page",
        pageNumber: 1,
        slideNumber: null,
        boundingBox: null,
        textSpan: null,
        timeRange: null,
        label: null,
      },
      sortOrder: 1,
      parentBlockId: null,
      confidence: 0.95,
    },
    {
      blockId: blockId2,
      kind: "paragraph",
      text: "<script>only script</script>",
      locator: {
        kind: "document_page",
        pageNumber: 1,
        slideNumber: null,
        boundingBox: null,
        textSpan: null,
        timeRange: null,
        label: null,
      },
      sortOrder: 2,
      parentBlockId: null,
      confidence: 0.95,
    },
  ];

  const result = sanitizeExtractedContentBlocks(blocks);

  assert(
    result.length === 1,
    caseId,
    `expected 1 block remaining after empty filter but got ${result.length}`,
  );
  assert(
    result[0]?.text === "Valid content",
    caseId,
    "first block text must match",
  );
}

export async function runResourceTextSanitizerUnitSuite(): Promise<void> {
  await runStripsDangerousScriptTagsCase();
  await runStripsInlineEventHandlersCase();
  await runStripsNullBytesAndControlCharactersCase();
  await runNormalizesUnicodeHomoglyphsCase();
  await runPreservesLatexFormulasCase();
  await runPreservesCodeAndTablesCase();
  await runEnforcesBlockBudgetCase();
  await runSanitizesBlockArrayCase();
}

await runResourceTextSanitizerUnitSuite();
