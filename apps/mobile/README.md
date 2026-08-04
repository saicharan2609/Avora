# @avora/mobile

Owner: @avora/mobile  
Package type: application  
Deployable: EAS to App Store and Play Store  
Publishable: no

## Purpose

`@avora/mobile` is the Expo primary client composition root for Avora.

It owns the mobile routing surface, mobile runtime configuration seam, app assets location, and Expo build profile configuration.

Stage 5 Group 4 establishes the first runnable mobile application shell. It does not implement product features, authentication, database access, Supabase integration, AI behaviour, retrieval, jobs, provider SDK access, business logic, or tests.

## Public surface

This application has no package export surface.

Its runtime surfaces are:

- `app/`
- `src/surfaces/`
- `src/navigation/`
- `src/offline/`
- `src/notifications/`
- `assets/`
- `app.config.ts`
- `eas.json`
- `env.ts`

## Requirement trace

- REPO-003
- REPO-004
- REPO-005
- REPO-006
- ENG-011
- ENG-013
- ENG-014
- ENG-018
- ENG-033
- ENG-100
- SEC-005
- SEC-124
- SEC-125
- SEC-126
- SEC-127
- AOQ-02

## Workspace dependencies

- `@avora/core`
- `@avora/domain`
- `@avora/ui-mobile`
- `@avora/config`

## Runtime dependencies

- `expo`
- `expo-router`
- `react`
- `react-native`

## Directory responsibilities

- `app/` owns Expo Router file-based surfaces.
- `src/surfaces/` is reserved for Layer-3 mobile surface compositions.
- `src/navigation/` is reserved for mobile navigation wiring.
- `src/offline/` is reserved for the future bounded offline subsystem.
- `src/notifications/` is reserved for future notification wiring.
- `assets/` owns mobile-only static assets.
- `app.config.ts` owns Expo application configuration.
- `eas.json` owns EAS build profiles.
- `env.ts` re-exports the approved client environment seam from `@avora/config`.

## Boundaries

This application must not import `@avora/db`, `@avora/ai`, `@avora/jobs`, `@avora/retrieval`, `@avora/adapters`, or `@avora/ui-web`.

This application must not contain service-role credentials, server-only logic, database schema, Supabase implementation, authentication implementation, AI implementation, retrieval implementation, jobs implementation, provider implementation, or tests in Stage 5 Group 4.

The offline, notification, authentication, and product surfaces remain later-stage work.