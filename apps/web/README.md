# @avora/web

Owner: @avora/web  
Package type: application  
Deployable: Vercel  
Publishable: no

## Purpose

`@avora/web` is the web application composition-root shell for Avora.

It is the future home for the Next.js App Router web surface and API route-handler host. Stage 3 creates only the workspace package shell, dependency wiring, TypeScript references, README, and empty public TypeScript surface.

## Public surface

- `@avora/web`

## Requirement trace

- REPO-003
- REPO-004
- REPO-005
- ENG-011
- ENG-013
- ENG-014
- ENG-100
- ENG-150
- NN-02

## Workspace dependencies

- `@avora/core`
- `@avora/domain`
- `@avora/db`
- `@avora/ai`
- `@avora/jobs`
- `@avora/adapters`
- `@avora/ui-web`
- `@avora/config`

## Boundaries

This application must not import `@avora/ui-mobile`.

This application must not import `@avora/retrieval` directly. Retrieval is reached through the AI Gateway boundary.

This application must not contain domain logic, business logic, database schema, Supabase configuration, authentication implementation, AI provider implementation, provider SDK usage, React pages, API route handlers, middleware, or tests in Stage 3.