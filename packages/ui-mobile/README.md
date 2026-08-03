# @avora/ui-mobile

Owner: @avora/design-system  
Package type: library  
Publishable: no

## Purpose

`@avora/ui-mobile` is the mobile UI package for Avora.

It is the future home for React Native / NativeWind primitives and mobile domain components that implement the approved design system for the Expo mobile surface.

## Public surface

- `@avora/ui-mobile`

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

This package must not import `@avora/ui-web`.

This package must not import `@avora/db`, `@avora/ai`, `@avora/jobs`, `@avora/retrieval`, or `@avora/adapters`.

This package must not contain Expo application screens, navigation, API handlers, database schema, Supabase logic, authentication logic, AI implementation, business logic, or tests.