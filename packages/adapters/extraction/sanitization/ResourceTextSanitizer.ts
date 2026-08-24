import type { ResourceExtractedContentBlock } from "@avora/domain/resources";

/**
 * Strips dangerous HTML tags and script injections while preserving
 * standard mathematical notation, code syntax, and markdown formatting.
 *
 * Requirements: ENG-222, SEC-281
 */
const DANGEROUS_HTML_TAGS_REGEX =
  /<(?:script|iframe|embed|object|applet|style|meta|link|base|form|input|button)\b[^>]*>.*?<\/(?:script|iframe|embed|object|applet|style|meta|link|base|form|input|button)>|<(?:script|iframe|embed|object|applet|style|meta|link|base|form|input|button)\b[^>]*\/?>/gis;

/**
 * Strips inline event handlers (e.g. onload=, onerror=, onclick=).
 */
const INLINE_EVENT_HANDLERS_REGEX =
  /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

/**
 * Strips javascript: or data: URL schemes when used maliciously.
 */
const JAVASCRIPT_SCHEMES_REGEX =
  /(?:javascript|vbscript|data\s*:\s*text\/html)\s*:/gi;

/**
 * Maximum character budget allowed per individual content block to prevent
 * memory exhaustion or Denial of Service attacks.
 */
export const MAXIMUM_BLOCK_TEXT_LENGTH = 10_000;

function isNonPrintableControlCode(code: number): boolean {
  return (
    (code >= 0 && code <= 8) ||
    code === 11 ||
    code === 12 ||
    (code >= 14 && code <= 31) ||
    code === 127
  );
}

function skipAnsiSequence(input: string, startIndex: number): number {
  if (input[startIndex + 1] !== "[") {
    return startIndex;
  }

  let index = startIndex + 2;
  while (index < input.length) {
    const char = input[index];
    if (char !== undefined && char >= "@" && char <= "~") {
      return index;
    }
    index += 1;
  }

  return input.length - 1;
}

/**
 * Strips null bytes, ANSI escape sequences, and non-printable control characters,
 * preserving horizontal tab (\t, 9), line feed (\n, 10), and carriage return (\r, 13).
 */
function stripControlAndEscapeCharacters(input: string): string {
  let result = "";

  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);

    if (code === 27) {
      i = skipAnsiSequence(input, i);
      continue;
    }

    if (isNonPrintableControlCode(code)) {
      continue;
    }

    result += input[i];
  }

  return result;
}

/**
 * Sanitizes a single raw text string extracted from a document or image.
 *
 * 1. Normalizes Unicode homoglyphs via NFKC normalization.
 * 2. Removes ANSI escape sequences, null bytes, and non-printable control characters.
 * 3. Strips dangerous HTML/script injection vectors.
 * 4. Normalizes CRLF / CR line breaks to standard LF (\n).
 * 5. Trims trailing whitespace from individual lines.
 * 6. Binds length to MAXIMUM_BLOCK_TEXT_LENGTH.
 */
export function sanitizeExtractedText(rawText: string): string {
  if (rawText.length === 0) {
    return "";
  }

  // 1. Unicode NFKC normalization
  let sanitized = rawText.normalize("NFKC");

  // 2. Remove ANSI escape sequences, null bytes, and non-printable control characters
  sanitized = stripControlAndEscapeCharacters(sanitized);

  // 3. Strip dangerous HTML script / embed tags and inline handlers
  sanitized = sanitized.replace(DANGEROUS_HTML_TAGS_REGEX, "");
  sanitized = sanitized.replace(INLINE_EVENT_HANDLERS_REGEX, "");
  sanitized = sanitized.replace(JAVASCRIPT_SCHEMES_REGEX, "");

  // 4. Normalize line breaks to \n
  sanitized = sanitized.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 5. Trim trailing whitespace per line
  sanitized = sanitized
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();

  // 6. Enforce maximum block length budget
  if (sanitized.length > MAXIMUM_BLOCK_TEXT_LENGTH) {
    sanitized = sanitized.slice(0, MAXIMUM_BLOCK_TEXT_LENGTH);
  }

  return sanitized;
}

/**
 * Sanitizes an array of extracted content blocks, ensuring all block texts
 * are safely normalized and free from injection payload vectors.
 */
export function sanitizeExtractedContentBlocks(
  blocks: readonly ResourceExtractedContentBlock[],
): readonly ResourceExtractedContentBlock[] {
  return blocks
    .map((block): ResourceExtractedContentBlock => {
      const sanitizedText = sanitizeExtractedText(block.text);

      return {
        ...block,
        text: sanitizedText,
      };
    })
    .filter((block) => block.text.length > 0);
}
