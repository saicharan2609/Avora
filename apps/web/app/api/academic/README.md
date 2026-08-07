# academic API

Owner: @avora/web  
Domain owner: @avora/academic

## Purpose

This directory owns the Next.js API boundary for academic setup.

Stage 8 Group 6 exposes authenticated academic setup endpoints for:

- reading setup progress;
- creating academic terms;
- creating subjects;
- creating recursive structure units;
- reading the academic structure tree.

## Public routes

- `GET /api/academic/setup/progress`
- `POST /api/academic/setup/terms`
- `POST /api/academic/setup/subjects`
- `POST /api/academic/setup/structure-units`
- `GET /api/academic/tree`

## Boundaries

Route handlers may import `@avora/core/api/academic`.

Route handlers may call web-local academic composition helpers.

Route handlers must not import `@supabase/supabase-js` directly.

Route handlers must not import concrete storage adapters.

Route handlers must not import worker, AI, retrieval, mobile, or UI packages.

Concrete repository composition belongs in `_shared/academic-composition.ts`.

Authentication resolution belongs in `_shared/academic-api-auth.ts`.

Domain orchestration belongs in `_shared/academic-setup-orchestrator.ts`.

This directory does not implement UI, mobile screens, AI behavior, retrieval behavior, worker behavior, or e2e flow harnesses.