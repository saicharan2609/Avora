# @avora/retrieval

Owner: @avora/ai  
Package type: library  
Publishable: no

## Purpose

`@avora/retrieval` is the retrieval package shell for Avora.

It is the future home for chunking, embedding, scope resolution, and hybrid search boundaries.

## Public surface

- `@avora/retrieval`

## Requirement trace

- REPO-001
- REPO-003
- REPO-004
- REPO-012
- ENG-011
- ENG-013
- ENG-016
- ENG-018
- NN-02
- NN-11

## Workspace dependencies

- `@avora/core`
- `@avora/db`
- `@avora/config`

## Boundaries

This package must not contain AI provider implementation, provider SDK usage, model names, business logic, database schema, Supabase configuration, API handlers, authentication logic, React components, React Native components, or tests.

Stage 3 creates only the workspace shell and future port location.