# @avora/mobile

Owner: @avora/mobile  
Package type: application  
Deployable: EAS to App Store and Play Store  
Publishable: no

## Purpose

`@avora/mobile` is the mobile application composition-root shell for Avora.

It is the future home for the Expo / React Native student surface. Stage 3 creates only the workspace package shell, dependency wiring, TypeScript references, README, and empty public TypeScript surface.

## Public surface

- `@avora/mobile`

## Requirement trace

- REPO-003
- REPO-004
- REPO-005
- REPO-006
- ENG-011
- ENG-013
- ENG-014
- ENG-100
- SEC-005

## Workspace dependencies

- `@avora/core`
- `@avora/domain`
- `@avora/ui-mobile`
- `@avora/config`

## Boundaries

This application must not import `@avora/db`, `@avora/ai`, `@avora/jobs`, `@avora/retrieval`, `@avora/adapters`, or `@avora/ui-web`.

This application must not contain service-role credentials, server-only logic, database schema, Supabase configuration, authentication implementation, AI implementation, React Native components, screens, navigation, offline implementation, push implementation, or tests in Stage 3.