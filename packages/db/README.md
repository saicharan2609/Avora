# @avora/db

Owner: @avora/data  
Package type: library  
Publishable: no

## Purpose

`@avora/db` owns Supabase database access, generated database types, concrete repositories, RLS harnesses, and schema-adjacent validation scripts.

Stage 6 established student identity persistence and role-scoped database client creation.

Stage 7 Group 4 established the resources repository.

Stage 7 Group 8 established durable resource ingestion job persistence. Resource ingestion jobs are inserted after upload completion and remain queued until worker-plane groups claim and execute them.

Stage 7 Group 9 adds claim, heartbeat, release, and failure-recording repository operations for resource ingestion jobs. These operations are intended for service-role worker runtime composition.

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

Resource ingestion job claim operations in Stage 7 Group 9 only update job ownership and operational status. Resource validation and ingestion execution belong to later groups.