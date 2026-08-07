# @avora/domain

Owner: per module  
Package type: library  
Publishable: no

## Purpose

`@avora/domain` is the domain package for Avora.

It contains the sixteen domain module boundaries named in the repository architecture. Stage 3 creates only the package shell, module entry points, and module README files. Domain services, repositories, policies, jobs, contracts, ports, and events are implemented later.

## Public surface

- `@avora/domain`
- `@avora/domain/identity`
- `@avora/domain/academic`
- `@avora/domain/resources`
- `@avora/domain/knowledge`
- `@avora/domain/tutor`
- `@avora/domain/notes`
- `@avora/domain/recall`
- `@avora/domain/assessment`
- `@avora/domain/mastery`
- `@avora/domain/planning`
- `@avora/domain/insights`
- `@avora/domain/sharing`
- `@avora/domain/billing`
- `@avora/domain/ai`
- `@avora/domain/jobs`
- `@avora/domain/platform`

## Requirement trace

- REPO-001
- REPO-003
- REPO-004
- REPO-007
- ENG-011
- ENG-013
- ENG-015
- ENG-016
- ENG-018
- NN-10

## Workspace dependencies

- `@avora/core`
- `@avora/db`
- `@avora/jobs`
- `@avora/config`

## Boundaries

This package must not import `@avora/ui-web` or `@avora/ui-mobile`.

This package must not contain HTTP framework code, API handlers, React components, React Native components, pages, screens, database schema, Supabase configuration, authentication implementation, AI provider implementation, vendor SDK usage, or tests.

Cross-module imports must resolve through a module public entry point.

## Stage 8 Group 1 — Academic structure contracts

Stage 8 Group 1 adds the `academic` domain module.

Public surface:

- `@avora/domain/academic`

The module defines vendor-free contracts for academic terms, subjects, recursive structure units, academic structure trees, academic paths, and placement confidence.

This group does not add database schema, repositories, route handlers, setup services, UI, mobile, worker behavior, AI behavior, retrieval behavior, or tests.

## Stage 8 Group 4 — Adaptive academic setup service

Stage 8 Group 4 adds the vendor-free academic setup service under:

- `academic/repositories/`
- `academic/services/`

The service supports first-term setup, subject creation, recursive structure-unit creation, and setup progress calculation.

The service depends on `AcademicSetupRepositoryPort` and does not import `@avora/db`.

No API contracts, web routes, UI, mobile, worker behavior, AI behavior, retrieval behavior, or e2e flows are added in this group.