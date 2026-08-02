# @avora/config

Owner: @avora/architecture  
Protected path: yes

## Purpose

`@avora/config` is the single source of shared repository configuration:
TypeScript, ESLint, Prettier, and typed environment schema.

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
- REPO-009
- REPO-011
- REPO-012
- REPO-013
- REPO-016
- ENG-001
- ENG-013
- ENG-017
- ENG-050
- ENG-267
- SEC-230
- SEC-231

## Rules

This package has no internal Avora dependencies. Any dependency added here is inherited by the repository configuration layer and requires explicit approval.