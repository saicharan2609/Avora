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