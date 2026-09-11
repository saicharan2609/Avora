import type { ReactElement } from "react";
import Svg, { Path } from "react-native-svg";

const SIZE_DP = 20;

/**
 * The Google "G" mark, ported verbatim (path data + brand colors) from the
 * reference's GoogleIcon component. Google's brand colors are fixed by
 * Google, not by Avora's theme — they have no Avora token and never should,
 * the same way this repository's design-token source files are the one
 * legitimate place raw color values live (see the matching exclusion for
 * this file in packages/config/eslint/rules/index.js).
 */
export function GoogleGlyph(): ReactElement {
  return (
    <Svg width={SIZE_DP} height={SIZE_DP} viewBox="0 0 24 24">
      <Path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.2h6.6a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.4-5.2 3.4-8.7Z" />
      <Path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2a7 7 0 0 1-6.6-4.8H1.4v3.1A12 12 0 0 0 12 24Z" />
      <Path fill="#FBBC05" d="M5.4 14.5a7.2 7.2 0 0 1 0-4.6V6.8H1.4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <Path fill="#EA4335" d="M12 4.7c1.8 0 3.3.6 4.6 1.8l3.4-3.4A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.4 6.8l4 3.1A7 7 0 0 1 12 4.7Z" />
    </Svg>
  );
}
