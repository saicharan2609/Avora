# @avora/db

Owner: @avora/data  
Package type: library  
Publishable: no

## Purpose

`@avora/db` is the database access package shell for Avora.

It is the future home for schema access, generated database types, repository access infrastructure, and RLS harness ownership.

## Public surface

- `@avora/db`

## Requirement trace

- REPO-001
- REPO-003
- REPO-004
- REPO-012
- ENG-011
- ENG-013
- ENG-016
- ENG-018
- NN-04

## Workspace dependencies

- `@avora/core`
- `@avora/config`

## Boundaries

This package must not contain database schema, migrations, RLS policies, Supabase configuration, authentication logic, API handlers, business logic, feature code, AI implementation, React components, React Native components, or tests.

Database artifacts belong under `supabase/`. Stage 3 creates only the workspace shell.