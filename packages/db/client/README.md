# client

Owner: @avora/data

## Purpose

The `client` directory owns role-scoped database client seams for Avora.

Stage 6 Group 4 introduces the typed Supabase database client factories used by trusted server-side composition roots.

## Public surface

- `@avora/db/client`

## Requirement trace

- REPO-018
- ENG-011
- ENG-013
- ENG-018
- ENG-053
- ENG-165
- ENG-173
- ENG-175
- NN-04
- SEC-005
- SEC-081
- SEC-082
- SEC-231

## Client roles

- `student` clients are scoped by a verified student access token.
- `service` clients use the service-role key and are reserved for the worker runtime.

## Boundaries

This directory must not import `@avora/domain`.

This directory must not contain application API handlers, feature repositories, business logic, React components, React Native components, pages, screens, authentication UI, AI implementation, retrieval implementation, jobs implementation, or tests in Stage 6 Group 4.

Service-role credentials must never be passed into web client components, mobile code, or any client-input runtime.