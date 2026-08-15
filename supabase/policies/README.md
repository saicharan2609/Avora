# policies

Owner: @avora/data  
Security co-owner: @avora/security

## Purpose

This directory contains reviewed Supabase RLS policy artifacts.

## Current policy artifacts

- resource ingestion jobs

## Boundaries

Policy artifacts document and mirror RLS posture for reviewed tables.

Student-scoped tables must deny cross-student access.

Worker and service-role mutation must rely on service-role bypass, not broad authenticated policies.

## Stage 8 Group 2

Stage 8 Group 2 adds:

- `academic_structure.policy.sql`

The policy artifact mirrors RLS for:

- `public.academic_terms`
- `public.subjects`
- `public.structure_units`

No authenticated delete policy is introduced.

## Stage 9 Group 2

Stage 9 Group 2 adds:

- `resource_extraction_documents.policy.sql`

The policy artifact mirrors RLS for:

- `public.resource_extraction_documents`
- `public.resource_extracted_content_blocks`

Authenticated users receive select-only access to their own extraction output.

No authenticated insert, update, or delete policy is introduced.

## Stage 10 Group 2

Stage 10 Group 2 adds:

- `chunks.policy.sql`

The policy artifact mirrors RLS for:

- `public.chunks`

Authenticated users receive select-only access to their own chunks.

No authenticated insert, update, or delete policy is introduced.
## Completion Group B — Resource placement policies

Completion Group B adds policy artifacts for:

- `public.resource_placements`
- `public.resource_placement_corrections`

Placement rows are student-scoped. Authenticated students may select, insert, and update their own placement rows. Correction rows are append-only from the application perspective: authenticated students may select and insert their own correction rows.

No authenticated delete policy is introduced.
## Compatibility correction — resource placement candidate policy artifact

Adds reviewed policy artifact:

- `resource_placement_candidates.policy.sql`

The authoritative executable policy creation lives in the migration:

- `20260814131500_resource_placement_candidates.sql`

Authenticated students may select their own placement candidates. No authenticated insert, update, or delete policy is introduced.
## Stage 10 Group 2 — Extraction schema and repositories

Stage 10 Group 2 extends extraction persistence with extracted pages, extraction failures, and extraction provenance.

The repository remains DB-shaped and does not import `@avora/domain`.

The persistence layer remains student-scoped through `student_id`, composite extraction-document ownership constraints, and RLS.

This group does not add worker execution, storage adapters, OCR, parsing, AI behavior, retrieval indexing, API routes, UI, or mobile behavior.