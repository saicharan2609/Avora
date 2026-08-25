# chunks repository

Owner: @avora/data

## Purpose

This directory owns concrete database access for retrieval chunks.

Stage 10 Group 3 adds repositories for:

- creating retrieval chunks;
- batch creating retrieval chunks;
- reading retrieval chunks by id;
- listing retrieval chunks by resource;
- listing retrieval chunks by extraction document;
- listing retrieval chunks by scope facets.

## Public surface

- `@avora/db/repositories/chunks`

## Requirement trace

- AD-18
- AD-19
- AIR-002
- AIR-006
- ENG-168
- ENG-221
- ENG-222
- ENG-224
- ENG-225
- ENG-226
- ENG-227

## Boundaries

This repository must not import `@avora/domain`.

This repository must not import `@avora/retrieval`.

This repository must not import `@avora/ai`.

This repository must not import `@avora/adapters`.

This repository must not import `@avora/jobs`.

This repository must not import UI packages or apps.

This repository may use generated Supabase database types and role-scoped Supabase clients.

This repository owns concrete persistence access only. Chunking algorithms, scope resolution runtime, insufficiency, AI Gateway context assembly, citation verification, worker execution, route handlers, UI, and mobile behavior belong to later groups.

## Stage 12 Group 3 — Hybrid search

Stage 12 Group 3 adds `searchRetrievalChunksHybrid`, which pre-filters by student and scope and returns chunks ranked by Reciprocal Rank Fusion of dense vector similarity (`chunk_embeddings`) and keyword relevance (`chunks.content_tsv`, `architecture.md` section 17.4).

The ranking itself runs inside the `public.search_chunks_hybrid` SQL function (`supabase/migrations/20260825090000_hybrid_retrieval_search.sql`), called via `client.rpc(...)`. That function is `SECURITY DEFINER` — the only way to grant `authenticated` callers a role-scoped path to `chunk_embeddings`, which intentionally carries no `authenticated` RLS policy (`20260824091000_chunk_embeddings.sql`) — but it independently re-asserts `auth.uid() = p_student_id` before reading a single row, so the pre-filter is stricter than, and independent of, table-level RLS (ENG-171, ENG-225, SEC-290, SEC-291). This keeps the elevated-privilege surface to one auditable ranking query; the full chunk rows returned to the caller are re-read through the ordinary `authenticated` `chunks_select_own` RLS policy, with an explicit `student_id` equality re-check in this repository method as a second, independent ownership assertion (SEC-291).

This method does not compute the query embedding — callers (composition roots) supply `queryEmbedding` already computed through `@avora/ai`'s `EmbeddingPort`, since this repository must not import `@avora/ai` or hold a provider SDK (NN-02).