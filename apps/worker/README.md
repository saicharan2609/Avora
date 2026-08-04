# @avora/worker

Owner: @avora/platform  
Package type: application  
Deployable: OCI image to container runtime  
Publishable: no

## Purpose

`@avora/worker` is the container worker plane composition root for Avora.

It is the deployable runtime reserved for long-running, expensive, retryable work. Stage 5 Group 5 establishes the first runnable worker shell, health endpoint, runtime directory structure, environment seam, Dockerfile, TypeScript wiring, and package scripts.

This group does not implement claim-loop behavior, job handlers, database access, Supabase integration, AI behavior, retrieval behavior, adapter behavior, authentication, APIs, business logic, or tests.

## Public surface

This application has no package export surface.

Its runtime surfaces are:

- `src/main.ts`
- `src/runtime/`
- `src/handlers/`
- `env.ts`
- `Dockerfile`

## Requirement trace

- REPO-003
- REPO-004
- REPO-005
- AD-08
- AD-11
- ENG-011
- ENG-013
- ENG-014
- ENG-018
- ENG-100
- ENG-150
- ENG-155
- ENG-192
- SEC-005
- SEC-231
- SEC-240
- SEC-503
- NN-04
- NN-05

## Workspace dependencies

- `@avora/core`
- `@avora/domain`
- `@avora/db`
- `@avora/ai`
- `@avora/jobs`
- `@avora/retrieval`
- `@avora/adapters`
- `@avora/config`

## Directory responsibilities

- `src/main.ts` owns worker bootstrapping and the health listener.
- `src/runtime/` is reserved for claim-loop, checkpoint, and shutdown runtime seams.
- `src/handlers/` is reserved for future job handlers, one file per job class.
- `env.ts` re-exports the approved worker environment seam from `@avora/config`.
- `Dockerfile` owns the pinned worker OCI image build.
- `__tests__/` is reserved for colocated package tests.

## Boundaries

This application must not import `@avora/ui-web` or `@avora/ui-mobile`.

This application must not accept client traffic.

This application must not use an HTTP framework.

The health endpoint is the only listener and takes no request body.

This application is the only deployable runtime allowed to receive the Supabase service-role credential. The repository must not contain secret values.

Stage 5 Group 5 does not implement claim loops, job handlers, queue behavior, checkpoint behavior, heartbeat behavior, database access, Supabase logic, authentication implementation, AI implementation, retrieval implementation, adapter implementation, APIs, React components, React Native components, pages, screens, or tests.