# @avora/core

Owner: @avora/platform  
Package type: library  
Publishable: no

## Purpose

`@avora/core` owns Avora's lowest-level shared primitives.

It contains shared identity brands, contract helpers, event primitives, error contracts, query-key helpers, observability contracts, text primitives, time primitives, and validation seams.

Stage 7 Group 5 adds shared resource upload API contracts under `@avora/core/contracts/resources`.

## Public surface

- `@avora/core`
- `@avora/core/identity`
- `@avora/core/contracts`
- `@avora/core/contracts/resources`
- `@avora/core/domain-types`
- `@avora/core/events`
- `@avora/core/errors`
- `@avora/core/query-keys`
- `@avora/core/observability`
- `@avora/core/text`
- `@avora/core/time`
- `@avora/core/validation`

## Requirement trace

- REPO-003
- REPO-004
- REPO-007
- ENG-011
- ENG-013
- ENG-015
- ENG-016
- ENG-018
- ENG-150
- ENG-156
- ENG-176
- FR-032
- FR-035
- FR-036
- FR-037
- FR-039
- FR-042
- NFR-004
- NFR-031
- NFR-034
- NN-04
- NN-05
- NN-10

## Workspace dependencies

- `@avora/config`

## Runtime dependencies

- `zod`

## Directory responsibilities

- `identity/` owns branded identifier types.
- `contracts/` owns shared API and transport contracts.
- `contracts/resources/` owns resource upload API contracts.
- `domain-types/` owns cross-domain scalar and classification types.
- `events/` owns shared domain-event primitives.
- `errors/` owns shared error contracts.
- `query-keys/` owns query-key helpers.
- `observability/` owns log-safe observability contracts.
- `text/` owns text primitives.
- `time/` owns clock and timestamp primitives.
- `validation/` owns validation result seams.

## Boundaries

This package must not import any application package.

This package must not import `@avora/domain`, `@avora/db`, `@avora/adapters`, `@avora/jobs`, `@avora/ai`, `@avora/retrieval`, `@avora/ui-web`, or `@avora/ui-mobile`.

This package must not contain route handlers, database execution, storage execution, domain services, worker handlers, React components, React Native components, pages, screens, or tests in Stage 7 Group 5.

API request contracts must not accept `studentId` for student-scoped operations. The composition root resolves identity from the authenticated session and passes it inward.

## Stage 8 Group 5 — Academic setup API contracts

Stage 8 Group 5 adds JSON-safe API contracts for academic setup.

New public surface:

- `@avora/core/api/academic`

Contract coverage:

- create academic term;
- create subject;
- create recursive structure unit;
- read academic setup progress;
- read academic structure tree.

This group does not add web route handlers, database repositories, domain services, UI, mobile, worker behavior, AI behavior, retrieval behavior, or e2e flows.