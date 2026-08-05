# migrations

Owner: @avora/data  
Protected path: yes

## Purpose

This directory owns versioned Supabase SQL migrations.

Stage 6 Group 2 introduced the first student-scoped table, `public.students`.

Stage 6 Group 3 wired the Supabase Auth database trigger that creates a `public.students` row on first auth-user creation.

Stage 7 Group 1 introduces `public.resources` and the storage bucket baseline required for upload intent.

## Requirement trace

- REPO-018
- ENG-163
- ENG-164
- ENG-169
- ENG-172
- ENG-173
- ENG-175
- ENG-176
- ENG-179
- ENG-180
- FR-032
- FR-035
- FR-036
- FR-037
- FR-042
- NFR-034
- NN-04
- SEC-040
- SEC-081
- SEC-082

## Rules

Every migration that creates a student-scoped table must include:

- RLS enabled on the table.
- Separate reviewed policies per operation.
- No permissive `ALL` policy.
- Index support for policy predicates where required.
- Negative-authorisation harness coverage in the same pull request.
- Generated schema type refresh in `packages/db/generated/`.

Every storage object path must begin with `student_id`.

Production data must never be committed here.

Authentication migrations must not introduce password credential storage or application-owned token handling.

## Current migrations

- `20260804174000_foundation.sql`
- `20260804234500_identity_students.sql`
- `20260805191000_identity_auth_user_trigger.sql`
- `20260805223000_resources_upload_intent.sql`