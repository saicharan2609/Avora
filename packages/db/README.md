# @avora/db

Owner: @avora/data  
Package type: library  
Publishable: no

## Purpose

`@avora/db` owns typed database access, role-scoped Supabase clients, generated schema types, concrete repository mechanisms, and the RLS policy harness.

Stage 6 established the Supabase repository foundation, student identity persistence, auth-user trigger, and role-scoped client seams.

Stage 7 Group 1 introduced `public.resources` as the durable resource upload-intent row.

Stage 7 Group 4 introduces the concrete resource repository implementation for `public.resources`. The implementation is structurally compatible with the resource-domain repository port but does not import `@avora/domain`, preserving the repository dependency matrix.

## Public surface

- `@avora/db`
- `@avora/db/client`
- `@avora/db/generated`
- `@avora/db/repositories`
- `@avora/db/repositories/resources`
- `@avora/db/ports`
- `@avora/db/rls`
- `@avora/db/rls/harness`

## Requirement trace

- REPO-018
- REPO-019
- ENG-011
- ENG-012
- ENG-016
- ENG-018
- ENG-053
- ENG-150
- ENG-163
- ENG-164
- ENG-169
- ENG-172
- ENG-173
- ENG-175
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
- SEC-040
- SEC-081
- SEC-082
- SEC-230

## Workspace dependencies

- `@avora/core`
- `@avora/config`

## Runtime dependencies

- `@supabase/supabase-js`

## Directory responsibilities

- `client/` owns role-scoped Supabase clients.
- `generated/` owns generated database schema types.
- `repositories/` owns concrete database repository mechanisms.
- `repositories/resources/` owns concrete access to `public.resources`.
- `ports/` owns database execution seams that are not module-specific.
- `rls/` owns RLS policy metadata and the negative-authorisation harness.
- `scripts/` owns package-local database artifact scripts.
- `src/` owns package-level barrel exports.

## Boundaries

This package must not import `@avora/domain`.

This package must not import `@avora/ui-web`, `@avora/ui-mobile`, `@avora/ai`, `@avora/jobs`, or `@avora/retrieval`.

This package executes parameterised database queries as the role represented by the supplied role-scoped client.

This package must not contain domain services, route handlers, storage SDK adapters outside approved database client use, authentication implementation, AI behavior, retrieval behavior, jobs behavior, React components, React Native components, pages, or screens.

Concrete repositories in this package are database mechanisms. Domain services consume repository ports from their domain package and may receive structurally compatible implementations from composition roots.