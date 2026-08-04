# @avora/ui-mobile

Owner: @avora/design-system  
Package type: library  
Publishable: no

## Purpose

`@avora/ui-mobile` is the mobile UI package for Avora.

It owns the mobile implementation seams for Avora primitives and mobile domain components. Stage 5 Group 2 establishes only token wiring, primitive contracts, and domain-component contracts for the Expo / React Native mobile surface.

## Public surface

- `@avora/ui-mobile`
- `@avora/ui-mobile/tokens`
- `@avora/ui-mobile/primitives`
- `@avora/ui-mobile/domain-components`

## Requirement trace

- REPO-001
- REPO-003
- REPO-004
- ENG-011
- ENG-014
- ENG-018
- ENG-123
- ENG-124
- ENG-297
- ENG-298
- NN-10
- Rule T-01
- Rule T-02
- Rule CP-01
- Rule CP-02
- Rule HO-02

## Workspace dependencies

- `@avora/core`
- `@avora/design-tokens`
- `@avora/config`

## Directory responsibilities

- `tokens/` exposes the mobile token seam from semantic design tokens.
- `primitives/` owns mobile primitive contracts.
- `domain-components/` owns mobile domain-component contracts.

## Boundaries

This package must not import `@avora/ui-web`.

This package must not import `@avora/db`, `@avora/ai`, `@avora/jobs`, `@avora/retrieval`, or `@avora/adapters`.

This package must not contain domain logic, business logic, API handlers, database implementation, Supabase implementation, authentication implementation, AI implementation, retrieval implementation, jobs implementation, pages, screens, or tests.

Stage 5 Group 2 does not implement React Native components. It establishes contracts only.