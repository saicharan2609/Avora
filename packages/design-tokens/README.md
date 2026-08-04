# @avora/design-tokens

Owner: @avora/design-system  
Protected path: yes  
Package type: library  
Publishable: no

## Purpose

`@avora/design-tokens` is Avora's shared source of truth for visual values across web and mobile.

It is the only package where literal visual values may exist. Web and mobile UI packages consume semantic Tier 2 tokens, never primitive Tier 1 tokens.

## Public surface

- `@avora/design-tokens`
- `@avora/design-tokens/tier-1`
- `@avora/design-tokens/tier-2`

## Requirement trace

- REPO-001
- REPO-003
- REPO-004
- ENG-011
- ENG-018
- ENG-123
- ENG-124
- ENG-322
- ENG-344
- Rule T-01
- Rule T-02
- Rule C-01
- Rule C-02
- Rule L-03
- Rule AX-08

## Token tiers

- `tier-1/` contains primitive visual values. Components must never reference these directly.
- `tier-2/` contains semantic tokens. Components may reference these tokens.
- `src/index.ts` exposes the package public surface.

## Boundaries

This package must not depend on any runtime package or external package.

This package must not import `@avora/core`, `@avora/domain`, `@avora/db`, `@avora/ai`, `@avora/jobs`, `@avora/retrieval`, `@avora/adapters`, `@avora/ui-web`, `@avora/ui-mobile`, or any application package.

This package must not contain React components, React Native components, pages, screens, APIs, business logic, authentication, database implementation, Supabase implementation, AI implementation, retrieval implementation, jobs implementation, or tests.

## Open verification notes

The Design System is still marked Draft. The token set records the current approved defaults from the design specification while preserving the open verification posture for final promotion.