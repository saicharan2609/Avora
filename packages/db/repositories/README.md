# repositories

Owner: @avora/data

## Purpose

The `repositories` directory owns concrete database repository mechanisms.

Domain modules own vendor-free repository ports. `@avora/db` owns concrete execution against generated database types and role-scoped Supabase clients.

Stage 7 Group 4 introduces the concrete resource repository for `public.resources`.

## Public surface

- `@avora/db/repositories`
- `@avora/db/repositories/resources`

## Requirement trace

- REPO-018
- ENG-011
- ENG-012
- ENG-016
- ENG-018
- ENG-053
- ENG-150
- ENG-176
- FR-032
- FR-035
- FR-036
- FR-037
- FR-039
- FR-042
- NFR-004
- NFR-034
- NN-04
- SEC-081
- SEC-082

## Current concrete repositories

- `resources`

## Boundaries

This directory must not import `@avora/domain`.

This directory must not contain domain services.

This directory must not contain API handlers, route handlers, UI components, storage adapters, AI behavior, retrieval behavior, jobs behavior, pages, or screens.

Repository implementations must execute through an explicitly supplied role-scoped database client.