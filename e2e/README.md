# @avora/e2e

Owner: @avora/qa  
Package type: test harness  
Publishable: no

## Purpose

`@avora/e2e` is the cross-cutting harness package for Avora.

It owns the top-level end-to-end harness directories that do not belong beside a single package. Stage 3 creates only the workspace package shell, TypeScript wiring, README, empty public TypeScript surface, and tracked canonical directories.

## Public surface

- `@avora/e2e`

## Requirement trace

- REPO-001
- REPO-003
- REPO-004
- REPO-020
- ENG-011
- ENG-019
- NN-01
- NN-12

## Workspace dependencies

- `@avora/config`

## Harness directories

- `flows/`
- `adaptivity/`
- `load/`
- `fixtures/`

## Boundaries

This package must not contain application features, business logic, API handlers, database schema, Supabase configuration, authentication implementation, AI implementation, React components, React Native components, pages, or screens.

Stage 3 does not implement test cases or fixtures.