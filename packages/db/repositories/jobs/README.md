# jobs repository

Owner: @avora/data

## Purpose

This directory owns concrete database access for durable job persistence.

Stage 7 Group 8 added durable resource ingestion job persistence. Upload completion inserts queued resource ingestion jobs.

Stage 7 Group 9 adds claim, heartbeat, release, and failure-recording operations for resource ingestion jobs. These operations are used by the worker runtime and do not execute ingestion logic.

## Public surface

- `@avora/db/repositories/jobs`

## Requirement trace

- ENG-011
- ENG-016
- ENG-018
- ENG-176
- FR-032
- FR-035
- FR-036
- FR-037
- FR-039
- FR-042
- NFR-004
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

This repository must not import `@avora/domain`.

This repository must not import `@avora/jobs`.

This repository must not import `@avora/ai`, `@avora/retrieval`, UI packages, or apps.

This repository may use generated Supabase database types and role-scoped Supabase clients.

This repository persists queued resource ingestion jobs, reads them by ID, claims queued jobs, records heartbeats, releases claims, and records claim failures.

Validation, extraction, OCR, parsing, AI, embeddings, retrieval, and resource lifecycle processing belong to later groups.