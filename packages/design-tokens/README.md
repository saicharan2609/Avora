# @avora/design-tokens

Owner: @avora/design-system  
Package type: library  
Publishable: no  
Protected path: yes

## Purpose

`@avora/design-tokens` is the shared source of truth for Avora visual tokens and brand assets.

It exists before UI packages so primitives and components can depend on semantic tokens instead of hard-coded visual values.

## Public surface

- `@avora/design-tokens`

## Requirement trace

- REPO-001
- REPO-003
- REPO-004
- ENG-011
- ENG-124
- ENG-322

## Boundaries

This package must not depend on application packages, domain packages, database packages, AI packages, jobs packages, adapter packages, or UI packages.

It must not contain React components, React Native components, screens, pages, application logic, business logic, database schema, Supabase configuration, APIs, tests, or AI logic.