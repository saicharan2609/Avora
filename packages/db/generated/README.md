# generated

Owner: @avora/data

## Purpose

This directory contains generated Supabase database types.

The file in this directory is treated as generated schema access code. It must match the reviewed Supabase migrations and policies.

Stage 7 Group 8 adds the generated shape for `public.resource_ingestion_jobs`.

## Public surface

- `@avora/db/generated`

## Boundaries

Generated database types must not contain domain logic, repository logic, route handlers, workers, UI, AI behavior, retrieval behavior, or tests.

The generated database type shape must remain compatible with `@supabase/supabase-js` typed PostgREST generics. Do not wrap the generated shape in deep readonly types.

## Stage 8 Group 2 — Academic structure generated types

Stage 8 Group 2 adds generated database type sections for:

- `public.academic_terms`
- `public.subjects`
- `public.structure_units`

The generated shape must remain compatible with `@supabase/supabase-js` typed PostgREST generics. Do not wrap the generated shape in deep readonly types.

## Stage 9 Group 2 — Resource extraction generated types

Stage 9 Group 2 adds generated database type sections for:

- `public.resource_extraction_documents`
- `public.resource_extracted_content_blocks`

The generated shape must remain compatible with `@supabase/supabase-js` typed PostgREST generics.

Do not wrap the generated shape in deep readonly types.

## Stage 10 Group 2 — Retrieval chunk generated types

Stage 10 Group 2 adds generated database type sections for:

- `public.chunks`

The generated shape must remain compatible with `@supabase/supabase-js` typed PostgREST generics.

Do not wrap the generated shape in deep readonly types.

Chunk rows are student-scoped derived artifacts and form the persistence basis for later retrieval and citation-bearing relations.
## Completion Group B — Resource placement generated types

Completion Group B adds generated database type sections for:

- `public.resource_placements`
- `public.resource_placement_corrections`

The generated shape must remain compatible with `@supabase/supabase-js` typed PostgREST generics.

Do not wrap the generated shape in deep readonly types.