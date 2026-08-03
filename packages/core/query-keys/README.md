# query-keys

Owner: @avora/architecture

## Purpose

The `query-keys` module is the canonical home for query-key type ownership.

Stage 4 Group 1 creates only the shared query-key seam. Concrete query keys are added later with the owning contracts.

## Public surface

- `@avora/core/query-keys`

## Requirement trace

- ENG-011
- ENG-113
- NN-10

## Boundaries

This module contains type contracts only.

It must not contain data fetching, caching behavior, UI code, API handlers, database access, business logic, AI implementation, or tests.