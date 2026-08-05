# @avora/adapters

Owner: @avora/platform  
Co-owner for credentialed adapters: @avora/security  
Package type: library  
Publishable: no

## Purpose

`@avora/adapters` is the non-AI vendor adapter edge for Avora.

It is the future home for adapters implementing mail, billing, payment collection, auth, blob storage, realtime, telemetry, and analytics ports declared by their owning modules or capability packages.

Stage 4 Group 5 established the directory structure, empty public seams, TypeScript wiring, and export wiring.

Stage 6 Group 5 introduces the Supabase Auth vendor adapter. It uses Supabase Auth without importing `@avora/domain`, preserving the adapter dependency boundary.

## Public surface

- `@avora/adapters`
- `@avora/adapters/supabase`
- `@avora/adapters/supabase/auth`
- `@avora/adapters/stripe`
- `@avora/adapters/psp`
- `@avora/adapters/resend`
- `@avora/adapters/sentry`
- `@avora/adapters/posthog`
- `@avora/adapters/otel`

## Requirement trace

- REPO-001
- REPO-003
- REPO-004
- REPO-012
- ENG-011
- ENG-013
- ENG-018
- ENG-019
- ENG-026
- ENG-183
- ENG-184
- NN-02
- SEC-040

## Workspace dependencies

- `@avora/core`
- `@avora/config`

## Runtime dependencies

- `@supabase/supabase-js`

## Directory responsibilities

- `supabase/` owns non-AI Supabase adapters such as auth, blob storage, and realtime.
- `supabase/auth/` owns the Supabase Auth adapter.
- `stripe/` is reserved for billing adapter code.
- `psp/` is reserved for domestic payment collection adapter code.
- `resend/` is reserved for mail adapter code.
- `sentry/` is reserved for error telemetry adapter code.
- `posthog/` is reserved for product analytics adapter code.
- `otel/` is reserved for OpenTelemetry adapter code.
- `__tests__/` is reserved for colocated adapter contract tests.

## Boundaries

This package must not import `@avora/domain`.

This package must not import `@avora/ai`.

This package must not import `@avora/ui-web` or `@avora/ui-mobile`.

Adapters never call domain services. The dependency direction points inward only.

This package may import approved vendor SDKs inside adapter directories.

Stage 6 Group 5 does not implement web login UI, mobile login UI, route handlers, API handlers, Supabase SSR helpers, database repository methods, session persistence policy, business logic, React components, React Native components, pages, screens, AI behavior, retrieval behavior, jobs behavior, or product features.