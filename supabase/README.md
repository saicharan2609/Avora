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