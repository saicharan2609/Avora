# domain-types

Owner: @avora/architecture

## Purpose

The `domain-types` module is the future home for shared Avora entity shapes and discriminated unions.

Stage 4 Group 1 creates only the shared type seam. Domain behavior and invariants live outside `@avora/core`.

## Public surface

- `@avora/core/domain-types`

## Requirement trace

- ENG-011
- ENG-058
- NN-10

## Boundaries

This module contains type contracts only.

It must not contain domain services, repositories, database access, API handlers, UI code, AI implementation, business logic, or tests.
## Stage 11 Group 6 — Tutor shared domain types

Stage 11 Group 6 adds shared tutor-domain scalar contracts used by AI Gateway tutor contracts.

Public surface:

- `@avora/core/domain-types`
- `TutorExplanationDepth`
- `TutorAnswerFormat`
- `TutorAnswerLanguage`

These contracts are shared primitives only. This group does not add tutor API request/response contracts, route handlers, AI provider invocation, retrieval execution, web behavior, mobile behavior, evals, or e2e flows.