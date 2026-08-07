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