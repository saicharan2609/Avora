# resources API routes

Owner: @avora/web  
Domain owner: @avora/data  
Security co-owner: @avora/security

## Purpose

This directory owns transport-only resource API route handlers for the web composition root.

Stage 7 Group 6 wires the resource upload-intent API boundary:

- declare upload intent;
- complete upload after bytes have reached private storage.

The route handlers validate shared API contracts from `@avora/core/contracts/resources`, resolve the authenticated student from the existing web session cookie, compose existing domain and infrastructure pieces, and return contract-shaped responses.

## Public routes

- `POST /api/resources/uploads`
- `POST /api/resources/uploads/[resourceId]/complete`

## Requirement trace

- ENG-011
- ENG-016
- ENG-018
- ENG-100
- ENG-150
- ENG-156
- ENG-176
- FR-032
- FR-035
- FR-036
- FR-037
- FR-039
- FR-042
- NFR-004
- NFR-031
- NFR-034
- NN-04
- NN-05
- NN-10
- SEC-040
- SEC-081
- SEC-082
- SEC-230
- SEC-231

## Boundaries

These route handlers are composition-root transport code.

These route handlers may import shared contracts, domain service factories, database repository implementations, role-scoped database client factories, and approved adapters.

These route handlers must not import Supabase SDKs directly.

These route handlers must not implement domain logic, database query logic, storage SDK behavior, ingestion jobs, AI behavior, retrieval behavior, React components, React Native components, pages, screens, or tests.

Request bodies must not accept `studentId`. The authenticated student is resolved from the web session.