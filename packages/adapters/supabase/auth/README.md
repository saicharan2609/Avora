# auth

Owner: @avora/platform  
Security co-owner: @avora/security

## Purpose

The `auth` directory owns the Supabase Auth vendor adapter.

The domain identity module declares the vendor-free authentication port. This adapter provides Supabase Auth behavior without importing `@avora/domain`, preserving the repository dependency matrix.

Stage 6 Group 6 adds OAuth redirect start and auth-code exchange behavior required by the web composition root.

## Public surface

- `@avora/adapters/supabase/auth`

## Requirement trace

- ENG-018
- ENG-026
- ENG-183
- ENG-184
- SEC-040
- NN-10

## Supported authentication methods

- Google OAuth
- Apple Sign In
- Email magic link

## Boundaries

This directory delegates authentication to Supabase Auth.

This directory must not implement credential handling, password storage, session issuance, token verification, OTP comparison, OAuth provider logic, or recovery mechanics.

This directory must not import `@avora/domain`.

This directory must not contain web login UI, mobile login UI, route handlers, API handlers, Supabase SSR helpers, database repository methods, session persistence policy, business logic, React components, React Native components, pages, screens, AI behavior, retrieval behavior, jobs behavior, or tests in Stage 6 Group 6.