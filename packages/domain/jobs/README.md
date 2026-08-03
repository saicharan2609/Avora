# jobs

Owner: @avora/platform

## Purpose

The `jobs` module is the future home for jobs-domain boundaries and invariants.

## Public surface

- `@avora/domain/jobs`

## Requirement trace

- REPO-007
- ENG-011
- ENG-015
- ENG-016
- ENG-018
- NN-05

## Boundaries

Stage 3 creates only this module shell.

This module must not contain queue implementation, job state machines, business logic, API handlers, database schema, Supabase configuration, vendor adapters, React components, React Native components, or tests.