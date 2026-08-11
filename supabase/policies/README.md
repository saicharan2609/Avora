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