# @avora/adapters

Owner: @avora/platform  
Package type: library  
Publishable: no

## Purpose

`@avora/adapters` is the non-AI vendor adapter package shell for Avora.

It is the future home for non-AI edge adapters such as mail, billing, authentication, and storage integrations after explicit dependency approval.

## Public surface

- `@avora/adapters`

## Requirement trace

- REPO-001
- REPO-003
- REPO-004
- REPO-012
- ENG-011
- ENG-013
- ENG-018
- ENG-026

## Workspace dependencies

- `@avora/core`
- `@avora/config`

## Boundaries

This package must not contain domain services, business logic, application features, API handlers, database schema, Supabase configuration, AI provider implementation, React components, React Native components, or tests.

No external vendor package is introduced in Stage 3.