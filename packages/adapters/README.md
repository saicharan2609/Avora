# @avora/adapters

Owner: @avora/platform  
Co-owner for credentialed adapters: @avora/security  
Package type: library  
Publishable: no

## Purpose

`@avora/adapters` is the non-AI vendor adapter edge for Avora.

It is the future home for adapters implementing mail, billing, payment collection, auth, blob storage, realtime, telemetry, and analytics ports declared by their owning modules or capability packages.

Stage 4 Group 5 establishes only the directory structure, empty public seams, TypeScript wiring, and export wiring.

## Public surface

- `@avora/adapters`
- `@avora/adapters/supabase`
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
- NN-02

## Workspace dependencies

- `@avora/core`
- `@avora/config`

## Directory responsibilities

- `supabase/` is reserved for non-AI Supabase adapters such as auth, blob storage, and realtime.
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

Stage 4 Group 5 does not add vendor SDKs, credentials, adapter implementation, business logic, database schema, Supabase configuration, APIs, authentication implementation, AI implementation, UI code, or tests.