export const tier1Tokens = {
  color: {
    neutral: {
      0: "#05090C",
      1: "#080D11",
      2: "#0E151B",
      3: "#151E26",
      4: "#1B2630",
      5: "#24313D",
      6: "#35485A",
      7: "#4A5A68",
      8: "#6B7E8F",
      9: "#9EB0C0",
      10: "#E9EFF5",
    },
    accent: {
      1: "#72EAC6",
      2: "#4DE5B5",
      3: "#26D19B",
    },
    feedback: {
      success: "#7DD3A8",
      warning: "#F8D66D",
      danger: "#F87171",
      info: "#7DD3FC",
    },
    // Rule EL-02 (docs/DESIGN-SYSTEM.md §16.1): the scrim/shadow that
    // separates an E3 overlay from the scrolling surface behind it.
    shadow: "#000000",
  },
  space: {
    0: "0",
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
    16: "64px",
  },
  size: {
    touchTarget: "44px",
    divider: "1px",
    progressTrack: "4px",
    containerSm: "560px",
    containerMd: "760px",
    controlSm: "32px",
    controlMd: "40px",
    controlLg: "48px",
    controlXl: "56px",
  },
  radius: {
    none: "0",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    full: "9999px",
  },
  typography: {
    family: {
      sans: "system-ui",
      // RN's generic "monospace" resolves to a platform default monospace
      // face on both iOS and Android with no font asset to load. Reserved
      // for step counters, stat figures and code-like identifiers (subject
      // codes) — never for prose (docs/DESIGN-SYSTEM.md TY-02 still applies
      // to body/heading text).
      mono: "monospace",
    },
    size: {
      eyebrow: "11px",
      caption: "12px",
      label: "13px",
      body: "14px",
      bodyLg: "16px",
      titleSm: "16px",
      titleMd: "20px",
      titleLg: "24px",
      display: "28px",
      figureSm: "18px",
      figure: "24px",
      figureXl: "32px",
    },
    lineHeight: {
      eyebrow: "14px",
      caption: "16px",
      label: "18px",
      body: "20px",
      bodyLg: "24px",
      titleSm: "24px",
      titleMd: "28px",
      titleLg: "32px",
      display: "34px",
      figureSm: "22px",
      figure: "30px",
      figureXl: "40px",
    },
    // Tracking, in px, pre-computed from the em ratios in docs/DESIGN-SYSTEM.md §13.3.
    // Positive widens (eyebrow, label, caption); negative tightens display/figure roles.
    letterSpacing: {
      eyebrow: "0.7px",
      caption: "0.2px",
      label: "0.1px",
      body: "0px",
      bodyLg: "0px",
      titleSm: "0px",
      titleMd: "-0.2px",
      titleLg: "-0.2px",
      display: "-0.6px",
      figureSm: "-0.2px",
      figure: "-0.5px",
      figureXl: "-1px",
    },
    weight: {
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },
  duration: {
    instant: "0ms",
    fast: "120ms",
    normal: "180ms",
    slow: "240ms",
  },
  opacity: {
    disabled: "0.48",
    muted: "0.72",
  },
} as const;

export type Tier1Tokens = typeof tier1Tokens;