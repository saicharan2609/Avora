# supabase

Owner: @avora/platform  
Security co-owner: @avora/security

## Purpose

The `supabase` adapter directory owns non-AI Supabase vendor adapters.

Stage 6 Group 5 introduces the Supabase Auth adapter. Later groups may add storage and realtime adapters in this directory without moving the auth boundary.

## Public surface

- `@avora/adapters/supabase`
- `@avora/adapters/supabase/auth`

## Requirement trace

- ENG-018
- ENG-026
- ENG-183
- ENG-184
- SEC-040
- NN-10

## Boundaries

This directory must not import `@avora/domain`.

This directory must not import `@avora/ui-web`, `@avora/ui-mobile`, or `@avora/ai`.

This directory may import Supabase vendor SDKs.

This directory must not contain application routes, UI login surfaces, database repositories, business logic, AI behavior, retrieval behavior, jobs behavior, or tests in Stage 6 Group 5.