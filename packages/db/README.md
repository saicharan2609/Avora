# @avora/db

Owner: @avora/data  
Package type: library  
Publishable: no

## Purpose

`@avora/db` is the data-access package for Avora.

It owns the package-level data-access seams for role-scoped clients, generated schema types, repository primitives, database ports, and the RLS negative-authorisation harness.

Stage 6 Group 2 introduces the first student-scoped database table, `public.students`, with deny-by-default RLS posture, reviewed policy artifact, generated database type update, and negative-authorisation harness coverage.

## Public surface

- `@avora/db`
- `@avora/db/client`
- `@avora/db/generated`
- `@avora/db/repositories`
- `@avora/db/ports`
- `@avora/db/rls`
- `@avora/db/rls/harness`

## Requirement trace

- REPO-001
- REPO-003
- REPO-004
- REPO-018
- REPO-019
- ENG-011
- ENG-013
- ENG-016
- ENG-018
- ENG-019
- ENG-053
- ENG-162
- ENG-163
- ENG-164
- ENG-165
- ENG-169
- ENG-172
- ENG-173
- ENG-175
- ENG-179
- ENG-180
- NN-04
- NN-10
- NN-12
- SEC-081
- SEC-082

## Workspace dependencies

- `@avora/core`
- `@avora/config`

## Directory responsibilities

- `client/` owns future role-scoped client seams.
- `generated/` owns generated schema type artifacts from `supabase/`.
- `repositories/` owns future base repository primitives.
- `ports/` owns package-level database ports consumed across modules.
- `rls/harness/` owns the negative-authorisation harness contract.
- `rls/__tests__/` owns negative-authorisation coverage plans.
- `scripts/` owns package-owned database scripts.
- `__tests__/` is reserved for colocated package tests.

## Database commands

- `db:generate` guards generated schema type workflow wiring.
- `db:diff` guards migration-diff workflow wiring.
- `db:lint` checks Supabase artifact placement and policy-file shape.
- `test:rls` runs the RLS harness wiring check.

## Current database surface

- `public.students`

## Boundaries

This package must not import `@avora/domain`.

This package must not import `@avora/ui-web`, `@avora/ui-mobile`, `@avora/ai`, application packages, or harness packages.

This package must not contain domain services, feature business logic, API handlers, React components, React Native components, pages, screens, authentication implementation, AI implementation, or vendor adapter logic.

Stage 6 Group 2 does not implement authentication flows, application APIs, Supabase client implementation, repository methods, or feature data access.