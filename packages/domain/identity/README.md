# identity

Owner: @avora/security

## Purpose

The `identity` module owns identity-domain boundaries and invariants.

Stage 6 Group 4 establishes the vendor-free authentication boundary through `AuthPort`. Supabase Auth remains the authentication authority; this module does not implement credential handling, session issuance, token verification, OAuth provider logic, OTP comparison, or password handling.

## Public surface

- `@avora/domain/identity`

## Requirement trace

- REPO-007
- ENG-011
- ENG-015
- ENG-016
- ENG-018
- ENG-183
- ENG-184
- ENG-186
- SEC-040
- NN-10

## Internal layers

- `contracts/`
- `services/`
- `repositories/`
- `events/`
- `jobs/`
- `policies/`
- `ports/`
- `__tests__/`

## Boundaries

This module must not contain authentication implementation, credential storage, token verification implementation, API handlers, business logic, database schema, Supabase configuration, vendor adapters, React components, React Native components, pages, screens, or tests in Stage 6 Group 4.

This module may declare vendor-free identity contracts and ports.

Supabase-specific implementation belongs outside this module.