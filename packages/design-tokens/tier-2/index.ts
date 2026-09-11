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
  // Rule EL-01/EL-02 (docs/DESIGN-SYSTEM.md §16.1): shadow is used only at
  // E3/E4 (overlays, dialogs, toasts) — never on a card at rest.
  //
  // `accentGlow` is a scoped, deliberate exception to EL-01, reproducing the
  // reference's mint glow under a selected onboarding card/chip/tile, a
  // primary CTA, and a focused text input — the only contexts it may be
  // used in. It is not a general-purpose elevation shadow.
  shadow: {
    overlay: {
      color: tier1Tokens.color.shadow,
      opacity: 0.5,
      offsetY: 16,
      radius: 40,
      elevation: 12,
    },
    accentGlow: {
      color: tier1Tokens.color.accent[2],
      opacity: 0.45,
      offsetY: 6,
      radius: 20,
      elevation: 6,
    },
  },
  layout: {
    touchTarget: tier1Tokens.size.touchTarget,
    divider: tier1Tokens.size.divider,
    progressTrack: tier1Tokens.size.progressTrack,
    containerSm: tier1Tokens.size.containerSm,
    containerMd: tier1Tokens.size.containerMd,
  },
  control: {
    sm: tier1Tokens.size.controlSm,
    md: tier1Tokens.size.controlMd,
    lg: tier1Tokens.size.controlLg,
    xl: tier1Tokens.size.controlXl,
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
    family: {
      sans: tier1Tokens.typography.family.sans,
      mono: tier1Tokens.typography.family.mono,
    },
    eyebrow: {
      family: tier1Tokens.typography.family.sans,
      size: tier1Tokens.typography.size.eyebrow,
      lineHeight: tier1Tokens.typography.lineHeight.eyebrow,
      weight: tier1Tokens.typography.weight.semibold,
      letterSpacing: tier1Tokens.typography.letterSpacing.eyebrow,
    },
    caption: {
      family: tier1Tokens.typography.family.sans,
      size: tier1Tokens.typography.size.caption,
      lineHeight: tier1Tokens.typography.lineHeight.caption,
      weight: tier1Tokens.typography.weight.regular,
      letterSpacing: tier1Tokens.typography.letterSpacing.caption,
    },
    label: {
      family: tier1Tokens.typography.family.sans,
      size: tier1Tokens.typography.size.label,
      lineHeight: tier1Tokens.typography.lineHeight.label,
      weight: tier1Tokens.typography.weight.medium,
      letterSpacing: tier1Tokens.typography.letterSpacing.label,
    },
    body: {
      family: tier1Tokens.typography.family.sans,
      size: tier1Tokens.typography.size.body,
      lineHeight: tier1Tokens.typography.lineHeight.body,
      weight: tier1Tokens.typography.weight.regular,
      letterSpacing: tier1Tokens.typography.letterSpacing.body,
    },
    bodyLg: {
      family: tier1Tokens.typography.family.sans,
      size: tier1Tokens.typography.size.bodyLg,
      lineHeight: tier1Tokens.typography.lineHeight.bodyLg,
      weight: tier1Tokens.typography.weight.regular,
      letterSpacing: tier1Tokens.typography.letterSpacing.bodyLg,
    },
    titleSm: {
      family: tier1Tokens.typography.family.sans,
      size: tier1Tokens.typography.size.titleSm,
      lineHeight: tier1Tokens.typography.lineHeight.titleSm,
      weight: tier1Tokens.typography.weight.semibold,
      letterSpacing: tier1Tokens.typography.letterSpacing.titleSm,
    },
    titleMd: {
      family: tier1Tokens.typography.family.sans,
      size: tier1Tokens.typography.size.titleMd,
      lineHeight: tier1Tokens.typography.lineHeight.titleMd,
      weight: tier1Tokens.typography.weight.semibold,
      letterSpacing: tier1Tokens.typography.letterSpacing.titleMd,
    },
    titleLg: {
      family: tier1Tokens.typography.family.sans,
      size: tier1Tokens.typography.size.titleLg,
      lineHeight: tier1Tokens.typography.lineHeight.titleLg,
      weight: tier1Tokens.typography.weight.bold,
      letterSpacing: tier1Tokens.typography.letterSpacing.titleLg,
    },
    display: {
      family: tier1Tokens.typography.family.sans,
      size: tier1Tokens.typography.size.display,
      lineHeight: tier1Tokens.typography.lineHeight.display,
      weight: tier1Tokens.typography.weight.bold,
      letterSpacing: tier1Tokens.typography.letterSpacing.display,
    },
    figureSm: {
      family: tier1Tokens.typography.family.sans,
      size: tier1Tokens.typography.size.figureSm,
      lineHeight: tier1Tokens.typography.lineHeight.figureSm,
      weight: tier1Tokens.typography.weight.semibold,
      letterSpacing: tier1Tokens.typography.letterSpacing.figureSm,
    },
    figure: {
      family: tier1Tokens.typography.family.sans,
      size: tier1Tokens.typography.size.figure,
      lineHeight: tier1Tokens.typography.lineHeight.figure,
      weight: tier1Tokens.typography.weight.bold,
      letterSpacing: tier1Tokens.typography.letterSpacing.figure,
    },
    figureXl: {
      family: tier1Tokens.typography.family.sans,
      size: tier1Tokens.typography.size.figureXl,
      lineHeight: tier1Tokens.typography.lineHeight.figureXl,
      weight: tier1Tokens.typography.weight.bold,
      letterSpacing: tier1Tokens.typography.letterSpacing.figureXl,
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