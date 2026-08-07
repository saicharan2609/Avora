# supabase

Owner: @avora/data  
Package type: SQL artifacts  
Workspace member: no

## Purpose

This directory owns Supabase database artifacts as reviewed source.

## Current artifact groups

- `migrations/`
- `policies/`
- `seed/`
- `functions/`

## Stage 7 Group 8

Stage 7 Group 8 adds durable persistence for resource ingestion jobs through `public.resource_ingestion_jobs`.

The table stores queued ingestion requests after upload completion.

Worker claim, heartbeat, checkpoint, retry, dead-letter handling, validation, extraction, OCR, parsing, AI, embeddings, retrieval, UI, and mobile behavior are not implemented in this group.

## Boundaries

Migrations and policies are reviewed artifacts.

This directory must not contain application TypeScript code.

Service-role mutation relies on Supabase service-role bypass and must not be represented by permissive RLS policies.

## Stage 8 Group 2 — Academic structure graph

Stage 8 Group 2 adds reviewed Supabase artifacts for the academic structure graph.

New tables:

- `public.academic_terms`
- `public.subjects`
- `public.structure_units`

The artifacts preserve student-scoped RLS and same-student graph ownership.

Repositories, services, API routes, UI, mobile, AI, and retrieval are intentionally not included in this group.