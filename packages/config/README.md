# @avora/config

Owner: @avora/architecture  
Package type: configuration  
Publishable: no

## Purpose

`@avora/config` is the shared configuration package for the Avora monorepo.

It owns repository-level TypeScript, ESLint, Prettier, and typed environment configuration so application and library packages do not create separate local standards.

## Public surface

- `@avora/config/typescript/base`
- `@avora/config/typescript/library`
- `@avora/config/typescript/next`
- `@avora/config/typescript/expo`
- `@avora/config/typescript/node`
- `@avora/config/eslint/base`
- `@avora/config/eslint/react`
- `@avora/config/eslint/react-native`
- `@avora/config/eslint/node`
- `@avora/config/eslint/architecture`
- `@avora/config/prettier`
- `@avora/config/env/client`
- `@avora/config/env/server`
- `@avora/config/env/worker`
- `@avora/config/env/schema-contract`

## Requirement trace

- REPO-001
- REPO-003
- REPO-004
- ENG-001
- ENG-011
- ENG-013
- ENG-017
- ENG-322

## Boundaries

This package is configuration infrastructure only.

It must not contain application features, domain services, API handlers, UI components, database schema, Supabase configuration, AI logic, business logic, or tests.