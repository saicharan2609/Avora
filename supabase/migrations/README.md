# migrations

Owner: @avora/data  
Protected path: yes

## Purpose

This directory owns versioned Supabase SQL migrations.

Stage 6 Group 1 does not introduce application tables. The first migration in this directory establishes only baseline database posture.

## Requirement trace

- REPO-018
- ENG-173
- ENG-174
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
