# @avora/core

Owner: @avora/architecture  
Package type: library  
Publishable: no

## Purpose

`@avora/core` is the shared core package for Avora domain-facing contracts, shared types, validation contracts, and query-key ownership.

It is intentionally bootstrapped before domain, data, AI, retrieval, job, adapter, UI, and application packages so downstream packages have one canonical dependency root.

## Public surface

- `@avora/core`

## Requirement trace

- REPO-001
- REPO-003
- REPO-004
- ENG-011
- ENG-013
- ENG-053
- NN-10

## Boundaries

This package may depend on configuration only.

It must not contain application features, domain services, API handlers, UI components, database schema, Supabase configuration, AI logic, provider logic, business logic, or tests.