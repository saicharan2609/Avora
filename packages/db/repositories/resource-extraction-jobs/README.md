# resource extraction jobs repository

Owner: @avora/data

## Purpose

This directory owns concrete database access for durable resource extraction job persistence.

Stage 10 Group 4 added durable resource extraction job persistence, claim, heartbeat, release, completion, and failure-recording operations, mirroring the existing `repositories/jobs` (resource ingestion job) pattern.

## Public surface

- `@avora/db/repositories/resource-extraction-jobs`

## Requirement trace

- ENG-011
- ENG-016
- ENG-018
- ENG-176
- FR-042
- NFR-004
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

This repository persists queued resource extraction jobs, reads them by ID, claims queued jobs, records heartbeats, releases claims, records completion, and records failures.

Extraction execution, OCR, parsing, AI, embeddings, retrieval, and resource lifecycle processing decisions belong outside this repository.

There is no authenticated insert policy on `resource_extraction_jobs`: extraction jobs are enqueued only by the worker plane, never by direct student action.

## Stage 10 Group 4 — Transactional enqueue

`enqueueResourceExtractionJob` is **not** the path used after ingestion validation succeeds. That transition is created transactionally by a database trigger (`app_private.enqueue_resource_extraction_job_on_ingestion_success`, defined in `supabase/migrations/20260817120000_resource_extraction_jobs_transactional_enqueue.sql`) firing on `resource_ingestion_jobs` in the same transaction as the ingestion job's terminal `succeeded` write. This satisfies `ENG-154`/`AD-27`: the extraction job row can never fail to exist for a committed ingestion success, and can never exist for one that rolled back.

Replay safety (`ENG-139`) is enforced by the database via `resource_extraction_jobs_logical_identity_uniq`, a unique index on `(student_id, resource_id, payload->>'extractionStrategyVersion', payload->>'chunkingStrategyVersion')`, mirroring the existing idempotency key already used by `resource_extraction_documents`' own checkpoint constraint. The trigger inserts with `ON CONFLICT ... DO NOTHING`.

`enqueueResourceExtractionJob` remains on this repository's public surface for the `manual_reprocess_requested` reason — a distinct, explicit reprocessing action that is not triggered by ingestion success and has no current caller.
