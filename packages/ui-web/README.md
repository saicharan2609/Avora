# @avora/ui-web

Owner: @avora/design-system  
Package type: library  
Publishable: no

## Purpose

`@avora/ui-web` is the web UI package for Avora.

It is the future home for web primitives and web domain components that implement the approved design system for the Next.js web surface.

## Public surface

- `@avora/ui-web`

## Requirement trace

- REPO-001
- REPO-003
- REPO-004
- ENG-011
- ENG-014
- ENG-033
- ENG-124
- Rule HO-02

## Workspace dependencies

- `@avora/core`
- `@avora/design-tokens`
- `@avora/config`

## Boundaries

This package must not import `@avora/ui-mobile`.

This package must not import `@avora/db`, `@avora/ai`, `@avora/jobs`, `@avora/retrieval`, or `@avora/adapters`.

This package must not contain Next.js pages, route handlers, API handlers, database schema, Supabase logic, authentication logic, AI implementation, business logic, or tests.