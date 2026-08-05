# supabase

Owner: @avora/platform  
Security co-owner: @avora/security

## Purpose

The `supabase` adapter directory owns non-AI Supabase vendor adapters.

Stage 6 Group 5 introduced the Supabase Auth adapter.

Stage 7 Group 2 introduces the Supabase Storage adapter for private resource upload tickets, signed read URLs, object promotion, and object deletion.

## Public surface

- `@avora/adapters/supabase`
- `@avora/adapters/supabase/auth`
- `@avora/adapters/supabase/storage`

## Requirement trace

- ENG-018
- ENG-026
- ENG-176
- FR-035
- FR-036
- FR-037
- NFR-034
- SEC-040
- SEC-230
- SEC-231
- NN-04
- NN-10

## Boundaries

This directory must not import `@avora/domain`.

This directory must not import `@avora/ui-web`, `@avora/ui-mobile`, or `@avora/ai`.

This directory may import Supabase vendor SDKs.

This directory must not contain application routes, UI upload surfaces, database repositories, business logic, AI behavior, retrieval behavior, jobs behavior, or tests in Stage 7 Group 2.