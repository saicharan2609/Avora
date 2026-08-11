# @avora/retrieval

Owner: @avora/ai  
Package type: library  
Publishable: no

## Purpose

`@avora/retrieval` owns Avora's retrieval mechanics.

It is the future home for chunking, embedding orchestration, scope resolution, hybrid search, retrieval ports, and retrieval-side insufficiency decisions.

Stage 4 Group 5 establishes only the directory structure, empty public seams, TypeScript wiring, and export wiring.

## Public surface

- `@avora/retrieval`
- `@avora/retrieval/ports`
- `@avora/retrieval/chunking`
- `@avora/retrieval/strategies`
- `@avora/retrieval/scope`
- `@avora/retrieval/search`
- `@avora/retrieval/insufficiency`

## Requirement trace

- REPO-001
- REPO-003
- REPO-004
- REPO-012
- ENG-011
- ENG-013
- ENG-018
- ENG-019
- ENG-171
- ENG-225
- ENG-226
- NN-02
- NN-03
- NN-11

## Workspace dependencies

- `@avora/core`
- `@avora/db`
- `@avora/config`

## Directory responsibilities

- `ports/` owns package-level retrieval ports.
- `chunking/` is reserved for chunking mechanics.
- `strategies/` is reserved for retrieval strategy selection.
- `scope/` is reserved for scope resolution.
- `search/` is reserved for hybrid search mechanics.
- `insufficiency/` is reserved for retrieval-side insufficiency decisions.
- `__tests__/` is reserved for colocated package tests.

## Boundaries

This package must not import `@avora/ai`.

This package must not import `@avora/domain`.

This package must not import `@avora/ui-web` or `@avora/ui-mobile`.

This package must not import feature modules or provider SDKs.

Stage 4 Group 5 does not implement chunking, embeddings, scope resolution, search, insufficiency thresholds, provider access, business logic, database schema, Supabase logic, APIs, authentication, AI implementation, UI code, or tests.

## Stage 10 Group 1 — Retrieval chunk contracts

Stage 10 Group 1 adds the first Knowledge and Retrieval foundation.

New public surface:

- `@avora/retrieval/chunking`

New contract coverage:

- retrieval chunk identifiers;
- retrieval chunk source linkage;
- retrieval chunk locators;
- retrieval chunk content;
- retrieval chunk sanitisation metadata;
- retrieval chunk scope facets;
- retrieval chunk records;
- retrieval chunk creation inputs.

This group implements contracts only.

It does not add database persistence, migrations, repositories, embeddings, vector search, keyword search, hybrid search, runtime scope resolution, insufficiency thresholds, AI Gateway context assembly, citation verification, worker execution, web routes, UI, mobile screens, or E2E flows.