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