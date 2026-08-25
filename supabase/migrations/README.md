# migrations

Owner: @avora/data

## Purpose

This directory contains versioned Supabase SQL migrations.

## Current Stage 7 artifacts

- student identity persistence
- resources
- resource ingestion jobs

## Boundaries

Migrations must not contain application code.

Migrations must not implement worker execution, AI processing, retrieval, OCR, parsing, UI, or mobile behavior.

Stage 7 Group 8 adds `public.resource_ingestion_jobs` only.

## Stage 8 Group 2

Stage 8 Group 2 adds:

- `20260807083100_academic_structure.sql`

This migration creates the student-owned academic structure graph:

- `public.academic_terms`
- `public.subjects`
- `public.structure_units`

## Stage 9 Group 2

Stage 9 Group 2 adds:

- `20260807122600_resource_extraction_documents.sql`

This migration creates resource extraction persistence tables:

- `public.resource_extraction_documents`
- `public.resource_extracted_content_blocks`

## Stage 10 Group 2

Stage 10 Group 2 adds:

- `20260811172000_retrieval_chunks.sql`

This migration creates retrieval chunk persistence:

- `public.chunks`
## Completion Group B — Resource placement persistence

Completion Group B adds:

- `20260805223100_resources_student_resource_unique.sql`
- `20260814124500_resource_placements.sql`

The first migration makes the existing student-scoped resource foreign-key convention explicit by adding `resources_student_resource_unique`.

The second migration creates student-scoped resource placement persistence:

- `public.resource_placements`
- `public.resource_placement_corrections`

The migration preserves resource ownership, academic scope, placement confidence, candidate provenance, placement reason, accepted/tentative status, and correction history.

This group does not implement classification workers, placement services, placement APIs, correction e2e, extraction work, retrieval behavior, AI/provider behavior, UI, or mobile code.
## Compatibility correction — resource placement candidates

Adds:

- `20260814131500_resource_placement_candidates.sql`

This migration persists server-generated placement candidates for later API candidate reads and candidate acceptance.

It does not add web routes, API contracts, worker execution, AI/provider behavior, retrieval behavior, UI, mobile code, or Stage 11 behavior.
## Stage 10 Group 2 — Extraction schema and repositories

Stage 10 Group 2 extends extraction persistence with extracted pages, extraction failures, and extraction provenance.

The repository remains DB-shaped and does not import `@avora/domain`.

The persistence layer remains student-scoped through `student_id`, composite extraction-document ownership constraints, and RLS.

This group does not add worker execution, storage adapters, OCR, parsing, AI behavior, retrieval indexing, API routes, UI, or mobile behavior.

## Pre-Stage-12 readiness correction — resource upload ticket job idempotency

Adds:

- `20260823090000_resource_upload_ticket_jobs_idempotency.sql`

This migration adds a partial unique index preventing more than one concurrently in-flight `resource_upload_ticket_jobs` row from existing per resource, closing a data-integrity gap identified during the pre-Stage-12 readiness audit (ENG-139, ENG-157). It does not add worker execution, API routes, AI/provider behavior, UI, or mobile code.

## Stage 12 Group 2 — Embedding generation & vector indexing

Stage 12 Group 2 adds:

- `20260824090000_chunks_student_chunk_unique.sql`
- `20260824091000_chunk_embeddings.sql`
- `20260824092000_embedding_cache.sql`
- `20260824093000_resource_indexing_jobs_embedding_strategy_1536d.sql`

The first migration adds `chunks_student_chunk_unique` (mirroring `resources_student_resource_unique`), enabling the composite foreign key the second migration needs.

The second migration enables the `vector` extension and creates `public.chunk_embeddings`: dense vector embeddings for retrieval chunks, versioned by `embedding_strategy_version` (primary key `(chunk_id, embedding_strategy_version)`, never overwritten on re-embedding), with an HNSW cosine index and no authenticated-role RLS policy (raw vectors have no student-facing surface).

The third migration creates `public.embedding_cache`: the AD-30 / ENG-238 / SEC-322 content-addressed embedding cache, keyed only by `(content_hash, embedding_strategy_version)` with no student, resource, or chunk attribution, and no policy for any client-reachable role.

The fourth migration updates the literal `embeddingStrategyVersion` default written by `app_private.enqueue_resource_indexing_job_on_chunking_success()` (`20260818120000_resource_indexing_jobs_transactional_enqueue.sql`) from `gemini-embedding-001.3072d.v1` to `gemini-embedding-001.1536d.v1` via `create or replace function`, matching the Stage 12 Group 2 decision to request Gemini's truncated 1536-dimension output so `chunk_embeddings` can use the standard pgvector `vector` type with a standard HNSW index (pgvector's HNSW/IVFFlat indexes only support up to 2000 dimensions for that type).

This group does not add vector search query logic, scoped retrieval, hybrid search, AI Tutor orchestration, API routes, UI, mobile behavior, or a cache eviction/TTL policy.