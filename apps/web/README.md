# @avora/web

Owner: @avora/web  
Package type: application  
Deployable: Vercel  
Publishable: no

## Purpose

`@avora/web` is the Next.js web application composition root for Avora.

It owns the web routing surface, runtime configuration seam, instrumentation seam, static public asset location, and web rendering entry point.

Stage 5 Group 3 established the first runnable web application shell.

Stage 6 Group 6 added the first server-side web authentication route handlers for Supabase-backed OAuth start, magic-link start, auth callback exchange, and sign-out. These route handlers remain transport-only composition seams.

Stage 7 Group 6 added the first resource upload API route handlers. These route handlers validate shared API contracts, resolve the authenticated student from the web session, compose student-scoped database access, and return contract-shaped responses.

Stage 7 Group 7 adds the resource ingestion job handoff after successful upload completion. The web layer creates and enqueues a typed ingestion request through a vendor-free queue seam. It does not execute ingestion work during the HTTP request.

This package does not implement product features, database business logic, Supabase database integration internals, AI behaviour, retrieval, jobs infrastructure, provider SDK access, domain logic, or tests.

## Public surface

This application has no package export surface.

Its runtime surfaces are:

- `app/`
- `app/api/auth/`
- `app/api/resources/`
- `middleware.ts`
- `instrumentation.ts`
- `env.ts`
- `next.config.mjs`
- `tailwind.config.ts`
- `public/`

## Current API routes

- `GET /api/auth/oauth/google`
- `GET /api/auth/oauth/apple`
- `GET /api/auth/magic-link?email=...`
- `GET /api/auth/callback?code=...`
- `POST /api/auth/sign-out`
- `POST /api/resources/uploads`
- `POST /api/resources/uploads/[resourceId]/complete`

## Requirement trace

- REPO-003
- REPO-004
- REPO-005
- ENG-011
- ENG-013
- ENG-014
- ENG-016
- ENG-018
- ENG-100
- ENG-123
- ENG-124
- ENG-150
- ENG-156
- ENG-176
- ENG-183
- ENG-184
- ENG-186
- ENG-297
- ENG-298
- FR-032
- FR-035
- FR-036
- FR-037
- FR-039
- FR-042
- NFR-004
- NFR-031
- NFR-034
- NN-02
- NN-04
- NN-05
- NN-10
- SEC-040
- SEC-081
- SEC-082
- SEC-230
- SEC-231
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
- `app/api/` owns API route handlers.
- `app/api/auth/` owns transport-only authentication route handlers.
- `app/api/resources/` owns transport-only resource route handlers.
- `public/` owns web-only static assets.
- `middleware.ts` owns the future edge routing/session seam.
- `instrumentation.ts` owns the future OpenTelemetry registration seam.
- `env.ts` re-exports the approved web client environment seam from `@avora/config`.
- `next.config.mjs` owns Next.js runtime configuration.
- `tailwind.config.ts` is a local empty Tailwind config because the current repository has no shared Tailwind config export.

## Boundaries

This application must not import `@avora/ui-mobile`.

This application must not import `@avora/retrieval` directly. Retrieval is reached through the AI Gateway boundary.

This application must not import provider SDKs, Expo packages, or React Native packages.

This application must not contain domain logic, business logic, database schema, Supabase database implementation internals, AI implementation, retrieval implementation, jobs infrastructure, provider implementation, React Native components, or tests in Stage 7 Group 7.

Authentication route handlers are transport-only: validate request shape, call the auth adapter, set or clear web session cookies, and redirect.

Resource route handlers are transport-only: validate request shape, resolve the authenticated student, compose existing student-scoped database access, enqueue typed ingestion handoff requests after successful upload completion, and return contract-shaped JSON responses.

Student-scoped request bodies must not accept `studentId`. The authenticated composition root resolves identity from the web session and passes it inward.

Service-role credentials must not be required by this application.

Resource ingestion execution belongs to a later worker-plane group.