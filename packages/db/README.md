# @avora/db

Owner: @avora/data  
Package type: library  
Publishable: no

## Purpose

`@avora/db` is the data-access package for Avora.

It owns the package-level data-access seams for role-scoped clients, generated schema types, repository primitives, database ports, and the RLS negative-authorisation harness.

## Public surface

- `@avora/db`
- `@avora/db/client`
- `@avora/db/repositories`
- `@avora/db/ports`
- `@avora/db/rls`
- `@avora/db/rls/harness`

## Requirement trace

- REPO-001
- REPO-003
- REPO-004
- REPO-018
- ENG-011
- ENG-013
- ENG-016
- ENG-018
- ENG-019
- ENG-175
- NN-04
- NN-10
- NN-12

## Workspace dependencies

- `@avora/core`
- `@avora/config`

## Directory responsibilities

- `client/` owns the future role-scoped client seams.
- `generated/` is reserved for generated schema types from `supabase/`.
- `repositories/` owns future base repository primitives.
- `ports/` owns package-level database ports consumed across modules.
- `rls/harness/` owns the future negative-authorisation harness.
- `rls/__tests__/` is reserved for RLS negative-authorisation tests.
- `scripts/` is reserved for package-owned data scripts.
- `__tests__/` is reserved for colocated package tests.

## Boundaries

This package must not import `@avora/domain`.

This package must not import `@avora/ui-web`, `@avora/ui-mobile`, `@avora/ai`, application packages, or harness packages.

This package must not contain domain services, feature business logic, API handlers, React components, React Native components, pages, screens, authentication implementation, AI implementation, or vendor adapter logic.

Stage 4 Group 4 creates structure and empty seams only. It does not create database schema, migrations, generated schema types, Supabase configuration, Supabase client implementation, repository implementation, RLS tests, or package scripts.