# resource indexing jobs repository

Owner: @avora/data

## Purpose

This directory owns concrete database access for durable resource indexing job persistence.

Stage 11 added durable resource indexing job persistence, claim, heartbeat, release, completion, and failure-recording operations, mirroring the existing `repositories/resource-extraction-jobs` and `repositories/resource-chunking-jobs` pattern.

## Public surface

- `@avora/db/repositories/resource-indexing-jobs`

## Requirement trace

- ENG-011
- ENG-016
- ENG-018
- ENG-176
- ENG-168
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

This repository persists queued resource indexing jobs, reads them by ID, claims queued jobs, records heartbeats, releases claims, records completion, and records failures.

Embedding provider calls, embedding persistence (`chunk_embeddings`), and vector search decisions belong outside this repository.

There is no authenticated insert policy on `resource_indexing_jobs`: indexing jobs are enqueued only by the worker plane, never by direct student action.

## Stage 11 — Transactional enqueue

`enqueueResourceIndexingJob` is **not** the path used after resource chunking succeeds. That transition is created transactionally by a database trigger (`app_private.enqueue_resource_indexing_job_on_chunking_success`, defined in `supabase/migrations/20260818120000_resource_indexing_jobs_transactional_enqueue.sql`) firing on `resource_chunking_jobs` in the same transaction as the chunking job's terminal `succeeded` write, mirroring the extraction and chunking triggers. This satisfies `ENG-154`/`AD-27`.

Replay safety (`ENG-139`) is enforced by the database via `resource_indexing_jobs_logical_identity_uniq`, a unique index on `(student_id, resource_id, payload->>'chunkingStrategyVersion', payload->>'embeddingStrategyVersion')`. The trigger inserts with `ON CONFLICT ... DO NOTHING`.

`enqueueResourceIndexingJob` remains on this repository's public surface for the `manual_reindex_requested` and `embedding_strategy_backfill` reasons — distinct, explicit actions not triggered by chunking success and with no current caller.

## Payload shape note

`DbResourceIndexingJobPayload` does not carry `reason` or `priority` — those are dedicated queue columns, matching the extraction and chunking job pattern. `@avora/retrieval/indexing`'s `IndexResourceJobPayload` (the pre-existing contract this table's payload is address-compatible with) does carry `reason`/`priority` inline; callers reconstruct that shape by combining this record's `payload` with its `reason`/`priority` columns, exactly as `apps/worker/src/resource-extraction/ResourceExtractionJobHandlerAdapter.ts` already does for extraction jobs.
