# resource classification jobs repository

Owner: @avora/data

## Purpose

This directory owns concrete database access for durable resource classification job persistence.

Stage 12 Group 6 adds durable resource classification job persistence, claim, heartbeat, release, completion, and failure-recording operations, mirroring the existing `repositories/resource-extraction-jobs`, `repositories/resource-chunking-jobs`, and `repositories/resource-indexing-jobs` pattern.

## Public surface

- `@avora/db/repositories/resource-classification-jobs`

## Requirement trace

- FR-038
- FR-039
- AD-22
- ENG-029
- ENG-011
- ENG-016
- ENG-018
- ENG-176
- NN-04
- NN-05
- NN-10

## Boundaries

This repository must not import `@avora/domain`.

This repository must not import `@avora/jobs`.

This repository must not import `@avora/ai`, `@avora/retrieval`, UI packages, or apps.

This repository may use generated Supabase database types and role-scoped Supabase clients.

This repository persists queued resource classification jobs, reads them by ID, claims queued jobs, records heartbeats, releases claims, records completion, and records failures.

Classification matching logic, placement candidate persistence (`resource_placement_candidates`), and placement decisions belong outside this repository.

There is no authenticated insert policy on `resource_classification_jobs`: classification jobs are enqueued only by the worker plane via the database trigger described below, never by direct student action.

## Stage 12 Group 6 — Transactional enqueue

`enqueueResourceClassificationJob` is **not** the path used after resource chunking succeeds. That transition is created transactionally by a database trigger (`app_private.enqueue_resource_classification_job_on_chunking_success`, defined in `supabase/migrations/20260826101000_resource_classification_jobs_transactional_enqueue.sql`) firing on `resource_chunking_jobs` in the same transaction as the chunking job's terminal `succeeded` write — the same source table and event `resource_indexing_jobs`' own trigger uses (`20260818120000_resource_indexing_jobs_transactional_enqueue.sql`). This satisfies `ENG-154`/`AD-27`.

architecture.md 24.1 labels both `resource.index` and `resource.classify` "Post-extraction." The indexing trigger is the only precedent for that label, and it fires on chunking success, not extraction success directly — chunking is the last pipeline stage between "extraction" and either of these two peer jobs. Classification mirrors that exact precedent so that `public.chunks` rows (headings/content evidence) are guaranteed to exist for this resource before the classification job is claimed. An earlier draft of this migration instead fired on `resource_ingestion_jobs` success (immediately after upload validation); that left the worker's lexical classifier structurally starved of content evidence for the resource being classified, and has been corrected.

Replay safety (`ENG-139`) is enforced by the database via `resource_classification_jobs_logical_identity_uniq`, a unique index on `(student_id, resource_id, payload->>'classificationStrategyVersion', payload->>'placementPolicyVersion')`. The trigger inserts with `ON CONFLICT ... DO NOTHING`.

`enqueueResourceClassificationJob` remains on this repository's public surface for the `placement_reclassification_requested` reason — a distinct, explicit action not triggered by ingestion validation success and with no current caller (reserved for a later, explicitly student-triggered re-classification flow, out of Stage 12 Group 6 scope).
