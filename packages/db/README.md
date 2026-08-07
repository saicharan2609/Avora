# @avora/db

Owner: @avora/data  
Package type: library  
Publishable: no

## Purpose

`@avora/db` owns Supabase database access, generated database types, concrete repositories, RLS harnesses, and schema-adjacent validation scripts.

Stage 6 established student identity persistence and role-scoped database client creation.

Stage 7 Group 4 established the resources repository.

Stage 7 Group 8 established durable resource ingestion job persistence.

Stage 7 Group 9 added claim, heartbeat, release, and failure-recording repository operations for resource ingestion jobs.

Stage 7 Group 10 adds resource ingestion validation repository operations for transitioning uploaded resources to `processing` or `rejected`, and completing claimed validation jobs.

## Public surface

- `@avora/db`
- `@avora/db/client`
- `@avora/db/generated`
- `@avora/db/repositories`
- `@avora/db/repositories/resources`
- `@avora/db/repositories/jobs`

## Requirement trace

- REPO-003
- REPO-004
- ENG-011
- ENG-013
- ENG-016
- ENG-018
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
- NN-05
- NN-10
- SEC-040
- SEC-081
- SEC-082
- SEC-230
- SEC-231

## Workspace dependencies

- `@avora/core`
- `@avora/config`

## Runtime dependencies

- `@supabase/supabase-js`

## Current repositories

- `resources`
- `jobs`

## Boundaries

This package must not import `@avora/domain`.

This package must not import `@avora/ai`.

This package must not import `@avora/retrieval`.

This package must not import UI packages.

This package must not import apps.

This package owns concrete Supabase database access only. It does not own domain invariants, route handlers, worker execution, storage SDK behavior, AI behavior, retrieval behavior, React components, React Native components, pages, or screens.

Resource ingestion validation repository operations only update persistence state. Validation decisions are owned by `@avora/domain`.

## Stage 7 Group 11 RLS closure plan

Stage 7 Group 11 adds a resource ingestion RLS closure plan under:

- `rls/__tests__/resource-ingestion-stage7.rls-plan.json`

The plan covers student-owned resource visibility, resource ingestion job visibility, own-job insertion, cross-student denial, and the absence of authenticated update/delete policies for job execution state.

Worker mutation continues to rely on service-role bypass rather than permissive authenticated policies.

## Stage 8 Group 2 — Academic structure graph schema

Stage 8 Group 2 adds Supabase schema and RLS artifacts for the academic graph.

New tables:

- `public.academic_terms`
- `public.subjects`
- `public.structure_units`

The schema is student-scoped and uses composite foreign keys to preserve same-student ownership across terms, subjects, and recursive structure units.

No repositories are implemented in this group.

## Stage 8 Group 3 — Academic graph repositories

Stage 8 Group 3 adds concrete Supabase-backed repositories for the academic graph.

New public surface:

- `@avora/db/repositories/academic`

Repository coverage:

- academic term creation and reads;
- subject creation and reads;
- recursive structure unit creation and reads;
- full academic structure tree reads.

This group does not add domain services, API contracts, web routes, UI, mobile behavior, worker behavior, AI behavior, retrieval behavior, or e2e flows.

## Stage 8 Group 7 — Academic setup RLS closure plan

Stage 8 Group 7 adds an academic setup RLS closure plan under:

- `rls/__tests__/academic-setup-stage8.rls-plan.json`

The plan covers student-owned term visibility, subject visibility, recursive structure-unit visibility, cross-student denial, and the absence of authenticated delete policies for the academic setup graph.

The academic graph remains student-scoped through RLS and same-student composite foreign keys.