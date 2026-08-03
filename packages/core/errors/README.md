# errors

Owner: @avora/architecture

## Purpose

The `errors` module owns the shared type contract for structured Avora errors.

Stage 4 Group 1 creates only the shared error contract. Concrete error catalogues are added later by the owning capability.

## Public surface

- `@avora/core/errors`

## Requirement trace

- ENG-011
- ENG-158
- ENG-159
- NN-10

## Boundaries

This module contains type contracts only.

It must not contain error handling behavior, transport mapping, UI rendering, business logic, database access, AI implementation, or tests.