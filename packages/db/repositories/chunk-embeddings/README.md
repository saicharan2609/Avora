# chunk-embeddings repository

Owner: @avora/data

## Purpose

This directory owns concrete database access for `public.chunk_embeddings` (Stage 12 Group 2).

Stage 12 Group 2 adds repositories for:

- writing (upserting) chunk embeddings, versioned by embedding strategy;
- listing chunk embeddings for a resource at a given embedding strategy version.

Writes are idempotent: the primary key is `(chunk_id, embedding_strategy_version)`, so replaying
the same indexing job upserts the same rows rather than producing duplicates or failing
(`ENG-04`, `ENG-191`). A model/strategy upgrade never overwrites a prior version's row — it inserts
a new row under the new `embedding_strategy_version`, matching `architecture.md` section 17.2's
controlled-backfill requirement for re-embedding (`NN-06`, `NN-07`, `ENG-165`).

## Public surface

- `@avora/db/repositories/chunk-embeddings`

## Requirement trace

- AD-18
- AD-19
- AD-30
- ENG-163
- ENG-165
- ENG-168
- ENG-171
- ENG-238
- NN-04
- NN-06
- NN-07
- SEC-290

## Boundaries

This repository must not import `@avora/domain`.

This repository must not import `@avora/retrieval`.

This repository must not import `@avora/ai`.

This repository must not import `@avora/adapters`.

This repository must not import `@avora/jobs`.

This repository must not import UI packages or apps.

This repository may use generated Supabase database types and role-scoped Supabase clients.

This repository owns concrete persistence access only. It does not implement embedding provider
calls, the content-addressed embedding cache (`@avora/db/repositories/embedding-cache`), vector
search, hybrid retrieval, retrieval insufficiency, AI Gateway context assembly, citation
verification, worker orchestration, route handlers, UI, or mobile behavior.

`public.chunk_embeddings` carries no authenticated-role RLS policy (deny-by-default, `ENG-304`):
raw embedding vectors have no student-facing surface in the PRD. Only the service-role worker
plane reads or writes this table.
