# migrations

Owner: @avora/data  
Protected path: yes

## Purpose

This directory owns versioned Supabase SQL migrations.

Stage 6 Group 2 introduces the first student-scoped table, `public.students`.

## Requirement trace

- REPO-018
- ENG-163
- ENG-164
- ENG-169
- ENG-172
- ENG-173
- ENG-175
- ENG-179
- ENG-180
- NN-04
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

Production data must never be committed here.

## Current migrations

- `20260804174000_foundation.sql`
- `20260804234500_identity_students.sql`