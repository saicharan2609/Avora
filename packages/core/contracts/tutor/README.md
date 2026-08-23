# tutor contracts

Owner: @avora/core
Domain owner: @avora/ai

## Purpose

This directory owns transport-safe tutor API contracts for Stage 11 Group 8.

The contracts define request and response bodies for asking grounded tutor questions from the web API boundary.

## Public surface

- `@avora/core/contracts/tutor`
- `askTutorContract`
- `askTutorRequestBodySchema`
- `askTutorResponseBodySchema`

## Route

- `POST /api/tutor/ask`

## Boundaries

These contracts are transport contracts only.

They do not import `@avora/ai`, `@avora/retrieval`, `@avora/db`, app code, provider SDKs, or UI packages.

Request bodies must not include `studentId`. The authenticated student is resolved by the web route.

`askTutorResponseBodySchema` defines a single, complete JSON response only — it does not define a streaming/SSE response shape or an entitlement-denial response shape. Streaming and entitlement are deferred to a later group.
