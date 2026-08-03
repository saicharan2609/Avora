# identity

Owner: @avora/architecture

## Purpose

The `identity` module owns Avora identifier brands shared across the repository.

Identifier brands make accidental cross-use of identifiers a type error while remaining portable across web, mobile, and worker runtimes.

## Public surface

- `@avora/core/identity`

## Requirement trace

- ENG-011
- ENG-054
- NN-10
- NN-11

## Boundaries

This module contains type contracts only.

It must not contain database access, validation behavior, API handlers, UI code, AI implementation, business logic, or tests.