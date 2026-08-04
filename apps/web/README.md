# @avora/web

Owner: @avora/web  
Package type: application  
Deployable: Vercel  
Publishable: no

## Purpose

`@avora/web` is the Next.js web application composition root for Avora.

It owns the web routing surface, runtime configuration seam, instrumentation seam, static public asset location, and web rendering entry point.

Stage 5 Group 3 establishes the first runnable web application shell. It does not implement product features, authentication, API route handlers, database access, Supabase integration, AI behaviour, retrieval, jobs, provider SDK access, business logic, or tests.

## Public surface

This application has no package export surface.

Its runtime surfaces are:

- `app/`
- `middleware.ts`
- `instrumentation.ts`
- `env.ts`
- `next.config.mjs`
- `tailwind.config.ts`
- `public/`

## Requirement trace

- REPO-003
- REPO-004
- REPO-005
- ENG-011
- ENG-013
- ENG-014
- ENG-018
- ENG-100
- ENG-123
- ENG-124
- ENG-150
- ENG-297
- ENG-298
- NN-02
- NN-10
- Rule T-01
- Rule T-02
- Rule HO-02

## Workspace dependencies

- `@avora/core`
- `@avora/domain`
- `@avora/db`
- `@avora/ai`
- `@avora/jobs`
- `@avora/adapters`
- `@avora/ui-web`
- `@avora/config`

## Runtime dependencies

- `next`
- `react`
- `react-dom`

## Directory responsibilities

- `app/` owns App Router route groups that mirror surfaces, not backend modules.
- `app/(marketing)/` owns the public runnable shell route for this group.
- `app/(auth)/` is reserved for authentication surfaces.
- `app/(app)/` is reserved for authenticated application surfaces.
- `app/(admin)/` is reserved for admin surfaces.
- `app/api/` is reserved for API route handlers.
- `public/` owns web-only static assets.
- `middleware.ts` owns the future edge routing/session seam.
- `instrumentation.ts` owns the future OpenTelemetry registration seam.
- `env.ts` re-exports the approved web environment seam from `@avora/config`.
- `next.config.mjs` owns Next.js runtime configuration.
- `tailwind.config.ts` extends the shared Tailwind configuration.

## Boundaries

This application must not import `@avora/ui-mobile`.

This application must not import `@avora/retrieval` directly. Retrieval is reached through the AI Gateway boundary.

This application must not import provider SDKs, Expo packages, or React Native packages.

This application must not contain domain logic, business logic, database schema, Supabase implementation, authentication implementation, AI implementation, retrieval implementation, jobs implementation, provider implementation, or tests in Stage 5 Group 3.

API route handlers are not implemented in Stage 5 Group 3.