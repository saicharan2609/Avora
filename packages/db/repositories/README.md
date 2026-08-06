# repositories

Owner: @avora/data

## Purpose

This directory owns concrete Supabase repository implementations.

Repositories in this package execute through role-scoped Supabase clients and map database rows into package-owned records.

## Current repositories

- `resources`
- `jobs`

## Public surface

- `@avora/db/repositories`
- `@avora/db/repositories/resources`
- `@avora/db/repositories/jobs`

## Boundaries

Repositories in `@avora/db` must not import `@avora/domain`.

Repositories in `@avora/db` must not import `@avora/ai`, `@avora/retrieval`, UI packages, or apps.

Repositories in `@avora/db` must not implement domain invariants, route handlers, workers, storage SDK behavior, AI behavior, retrieval behavior, React components, React Native components, pages, or screens.