# auth route handlers

Owner: @avora/web  
Security co-owner: @avora/security

## Purpose

This directory owns transport-only authentication route handlers for the web composition root.

Stage 6 Group 6 wires OAuth start, email magic-link start, auth callback exchange, and sign-out through the Supabase Auth adapter.

## Public routes

- `GET /api/auth/oauth/google`
- `GET /api/auth/oauth/apple`
- `GET /api/auth/magic-link?email=...`
- `GET /api/auth/callback?code=...`
- `POST /api/auth/sign-out`

## Requirement trace

- ENG-100
- ENG-150
- ENG-183
- ENG-184
- ENG-186
- SEC-040
- NN-10

## Boundaries

These route handlers must not import Supabase SDKs directly.

These route handlers must not query the database.

These route handlers must not contain domain logic, product onboarding logic, dashboard logic, AI behavior, retrieval behavior, jobs behavior, React components, React Native components, pages, screens, or tests in Stage 6 Group 6.

These route handlers validate transport shape, call the auth adapter, set or clear web session cookies, and redirect.