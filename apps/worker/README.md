# @avora/worker

Owner: @avora/platform  
Package type: application  
Deployable: OCI image to container runtime  
Publishable: no

## Purpose

`@avora/worker` is the worker application composition-root shell for Avora.

It is the future home for the container worker plane that claims and executes long-running jobs. Stage 3 creates only the workspace package shell, dependency wiring, TypeScript references, README, and empty public TypeScript surface.

## Public surface

- `@avora/worker`

## Requirement trace

- REPO-003
- REPO-004
- REPO-005
- AD-08
- ENG-011
- ENG-013
- ENG-014
- ENG-100
- NN-05
- SEC-005

## Workspace dependencies

- `@avora/core`
- `@avora/domain`
- `@avora/db`
- `@avora/ai`
- `@avora/jobs`
- `@avora/retrieval`
- `@avora/adapters`
- `@avora/config`

## Boundaries

This application must not import `@avora/ui-web` or `@avora/ui-mobile`.

This application must not accept client traffic.

This application must not contain claim loops, job handlers, queue implementation, Docker configuration, health endpoints, database schema, Supabase configuration, authentication implementation, AI provider implementation, provider SDK usage, business logic, or tests in Stage 3.