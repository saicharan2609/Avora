# resource chunking jobs repository

Owner: @avora/data

## Purpose

This directory owns concrete database access for durable resource chunking job persistence.

Stage 11 added durable resource chunking job persistence, claim, heartbeat, release, completion, and failure-recording operations, mirroring the existing `repositories/resource-extraction-jobs` pattern.

## Public surface

- `@avora/db/repositories/resource-chunking-jobs`

## Requirement trace

- ENG-011
- ENG-016
- ENG-018
- ENG-176
- AIR-002
- AD-18
- AD-19
- NN-04
- NN-05
- NN-10

## Boundaries

This repository must not import `@avora/domain`.

This repository must not import `@avora/jobs`.

This repository must not import `@avora/ai`, `@avora/retrieval`, UI packages, or apps.

This repository may use generated Supabase database types and role-scoped Supabase clients.

This repository persists queued resource chunking jobs, reads them by ID, claims queued jobs, records heartbeats, releases claims, records completion, and records failures.

Chunking mechanics, retrieval chunk persistence, embeddings, and indexing decisions belong outside this repository.

There is no authenticated insert policy on `resource_chunking_jobs`: chunking jobs are enqueued only by the worker plane, never by direct student action.

## Stage 11 — Transactional enqueue

`enqueueResourceChunkingJob` is **not** the path used after resource extraction succeeds. That transition is created transactionally by a database trigger (`app_private.enqueue_resource_chunking_job_on_extraction_success`, defined in `supabase/migrations/20260818100000_resource_chunking_jobs_transactional_enqueue.sql`) firing on `resource_extraction_jobs` in the same transaction as the extraction job's terminal `succeeded` write, mirroring `app_private.enqueue_resource_extraction_job_on_ingestion_success`. This satisfies `ENG-154`/`AD-27`.

Replay safety (`ENG-139`) is enforced by the database via `resource_chunking_jobs_logical_identity_uniq`, a unique index on `(student_id, resource_id, extraction_document_id, payload->>'chunkingStrategyVersion')`. The trigger inserts with `ON CONFLICT ... DO NOTHING`.

`enqueueResourceChunkingJob` remains on this repository's public surface for the `manual_rechunk_requested` reason — a distinct, explicit rechunking action that is not triggered by extraction success and has no current caller.
