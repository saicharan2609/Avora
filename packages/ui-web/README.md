# @avora/ui-web

Owner: @avora/design-system  
Package type: library  
Publishable: no

## Purpose

`@avora/ui-web` is the web UI package for Avora.

It owns the web implementation seams for Avora primitives and web domain components. Stage 5 Group 2 establishes only token wiring, primitive contracts, and domain-component contracts for the Next.js web surface.

## Public surface

- `@avora/ui-web`
- `@avora/ui-web/tokens`
- `@avora/ui-web/primitives`
- `@avora/ui-web/domain-components`

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

- `tokens/` exposes the web token seam from semantic design tokens.
- `primitives/` owns web primitive contracts.
- `domain-components/` owns web domain-component contracts.

## Boundaries

This package must not import `@avora/ui-mobile`.

This package must not import `@avora/db`, `@avora/ai`, `@avora/jobs`, `@avora/retrieval`, or `@avora/adapters`.

This package must not contain domain logic, business logic, API handlers, database implementation, Supabase implementation, authentication implementation, AI implementation, retrieval implementation, jobs implementation, pages, screens, or tests.

Stage 5 Group 2 does not implement React components. It establishes contracts only.