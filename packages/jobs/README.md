# @avora/jobs

Owner: @avora/platform  
Package type: library  
Publishable: no

## Purpose

`@avora/jobs` is the job orchestration package shell for Avora.

It is the future home for queue abstractions, job definitions, state machines, and job-related ports.

## Public surface

- `@avora/jobs`

## Requirement trace

- REPO-001
- REPO-003
- REPO-004
- REPO-012
- ENG-011
- ENG-013
- ENG-016
- ENG-018
- NN-05

## Workspace dependencies

- `@avora/core`
- `@avora/db`
- `@avora/config`

## Boundaries

This package must not contain queue implementation logic, job state machines, business logic, database schema, Supabase configuration, API handlers, authentication logic, AI implementation, React components, React Native components, or tests.

Stage 3 creates only the workspace shell and future port location.