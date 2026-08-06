# resources API routes

Owner: @avora/web  
Domain owner: @avora/data  
Security co-owner: @avora/security

## Purpose

This directory owns transport-only resource API route handlers for the web composition root.

Stage 7 Group 6 established the resource upload API boundary:

- declare resource upload intent;
- complete resource upload after bytes have reached private storage.

Stage 7 Group 7 adds the resource ingestion job handoff after successful upload completion. The route creates and enqueues a typed ingestion request through a vendor-free queue seam after the resource row is marked uploaded.

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

These route handlers may import shared API contracts, role-scoped database client factories, concrete database repositories, domain queue port types, and job handoff envelope helpers.

These route handlers must not import Supabase SDKs directly.

These route handlers must not read or require service-role credentials.

These route handlers must not implement storage SDK behavior, database query internals, queue infrastructure, queue persistence, worker execution, ingestion jobs, AI behavior, retrieval behavior, React components, React Native components, pages, screens, or tests.

Request bodies must not accept `studentId`. The authenticated student is resolved from the web session.

No ingestion work executes during the HTTP request.