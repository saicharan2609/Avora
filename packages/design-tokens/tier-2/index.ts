import { tier1Tokens } from "../tier-1";

export const tier2Tokens = {
  surface: {
    sunken: tier1Tokens.color.neutral[0],
    base: tier1Tokens.color.neutral[1],
    raised: tier1Tokens.color.neutral[2],
    overlay: tier1Tokens.color.neutral[3],
    inverse: tier1Tokens.color.neutral[10],
  },
  border: {
    subtle: tier1Tokens.color.neutral[4],
    default: tier1Tokens.color.neutral[5],
    strong: tier1Tokens.color.neutral[6],
  },
  text: {
    primary: tier1Tokens.color.neutral[10],
    secondary: tier1Tokens.color.neutral[9],
    tertiary: tier1Tokens.color.neutral[8],
    disabled: tier1Tokens.color.neutral[7],
    inverse: tier1Tokens.color.neutral[1],
  },
  accent: {
    subtle: tier1Tokens.color.accent[1],
    default: tier1Tokens.color.accent[2],
    strong: tier1Tokens.color.accent[3],
  },
  feedback: {
    success: {
      fg: tier1Tokens.color.feedback.success,
    },
    warning: {
      fg: tier1Tokens.color.feedback.warning,
    },
    danger: {
      fg: tier1Tokens.color.feedback.danger,
    },
    info: {
      fg: tier1Tokens.color.feedback.info,
    },
  },
  ai: {
    provenance: {
      accent: tier1Tokens.color.accent[2],
    },
  },
  layout: {
    touchTarget: tier1Tokens.size.touchTarget,
    divider: tier1Tokens.size.divider,
    progressTrack: tier1Tokens.size.progressTrack,
  },
  space: {
    none: tier1Tokens.space[0],
    xs: tier1Tokens.space[1],
    sm: tier1Tokens.space[2],
    md: tier1Tokens.space[4],
    lg: tier1Tokens.space[6],
    xl: tier1Tokens.space[8],
    xxl: tier1Tokens.space[12],
  },
  radius: {
    sm: tier1Tokens.radius.sm,
    md: tier1Tokens.radius.md,
    lg: tier1Tokens.radius.lg,
    xl: tier1Tokens.radius.xl,
    full: tier1Tokens.radius.full,
  },
  type: {
    caption: {
      family: tier1Tokens.typography.family.sans,
      size: tier1Tokens.typography.size.caption,
      lineHeight: tier1Tokens.typography.lineHeight.caption,
      weight: tier1Tokens.typography.weight.regular,
    },
    body: {
      family: tier1Tokens.typography.family.sans,
      size: tier1Tokens.typography.size.body,
      lineHeight: tier1Tokens.typography.lineHeight.body,
      weight: tier1Tokens.typography.weight.regular,
    },
    titleSm: {
      family: tier1Tokens.typography.family.sans,
      size: tier1Tokens.typography.size.titleSm,
      lineHeight: tier1Tokens.typography.lineHeight.titleSm,
      weight: tier1Tokens.typography.weight.semibold,
    },
    titleMd: {
      family: tier1Tokens.typography.family.sans,
      size: tier1Tokens.typography.size.titleMd,
      lineHeight: tier1Tokens.typography.lineHeight.titleMd,
      weight: tier1Tokens.typography.weight.semibold,
    },
    titleLg: {
      family: tier1Tokens.typography.family.sans,
      size: tier1Tokens.typography.size.titleLg,
      lineHeight: tier1Tokens.typography.lineHeight.titleLg,
      weight: tier1Tokens.typography.weight.bold,
    },
    figureXl: {
      family: tier1Tokens.typography.family.sans,
      size: tier1Tokens.typography.size.figureXl,
      lineHeight: tier1Tokens.typography.lineHeight.figureXl,
      weight: tier1Tokens.typography.weight.bold,
    },
  },
  motion: {
    instant: tier1Tokens.duration.instant,
    fast: tier1Tokens.duration.fast,
    normal: tier1Tokens.duration.normal,
    slow: tier1Tokens.duration.slow,
  },
  state: {
    disabledOpacity: tier1Tokens.opacity.disabled,
    mutedOpacity: tier1Tokens.opacity.muted,
  },
} as const;

export type Tier2Tokens = typeof tier2Tokens;