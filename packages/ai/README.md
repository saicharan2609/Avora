# @avora/ai

Owner: @avora/ai  
Package type: library  
Publishable: no

## Purpose

`@avora/ai` is the AI Gateway package shell for Avora.

It is the future home for AI Gateway boundaries, AI-owned ports, provider adapters, prompt assets, routing configuration, and evaluation integration points.

## Public surface

- `@avora/ai`

## Requirement trace

- REPO-001
- REPO-003
- REPO-004
- REPO-012
- ENG-011
- ENG-013
- ENG-016
- ENG-018
- ENG-026
- NN-02
- NN-03
- NN-11

## Workspace dependencies

- `@avora/core`
- `@avora/db`
- `@avora/retrieval`
- `@avora/config`

## Boundaries

This package must not contain feature logic, domain services, application pages, API handlers, database schema, Supabase configuration, authentication logic, React components, React Native components, or tests.

No provider SDK, model name, prompt implementation, routing implementation, or AI business logic is introduced in Stage 3.