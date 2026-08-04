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
      1: "#7DD3FC",
      2: "#38BDF8",
      3: "#0EA5E9",
    },
    feedback: {
      success: "#7DD3A8",
      warning: "#F8D66D",
      danger: "#F87171",
      info: "#7DD3FC",
    },
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
    },
    size: {
      caption: "12px",
      body: "14px",
      titleSm: "16px",
      titleMd: "20px",
      titleLg: "24px",
      figureXl: "32px",
    },
    lineHeight: {
      caption: "16px",
      body: "20px",
      titleSm: "24px",
      titleMd: "28px",
      titleLg: "32px",
      figureXl: "40px",
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