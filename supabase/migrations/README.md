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