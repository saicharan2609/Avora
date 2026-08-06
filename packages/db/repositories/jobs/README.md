# jobs repository

Owner: @avora/data

## Purpose

This directory owns concrete database access for durable job persistence.

Stage 7 Group 8 added durable resource ingestion job persistence.

Stage 7 Group 9 added claim, heartbeat, release, and failure-recording operations for resource ingestion jobs.

Stage 7 Group 10 adds job completion after successful resource ingestion validation.

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

This repository persists queued resource ingestion jobs, reads them by ID, claims queued jobs, records heartbeats, releases claims, records failures, and records successful validation completion.

Validation, extraction, OCR, parsing, AI, embeddings, retrieval, and resource lifecycle processing decisions belong outside this repository.