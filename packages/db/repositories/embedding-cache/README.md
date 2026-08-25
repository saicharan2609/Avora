# embedding-cache repository

Owner: @avora/data

## Purpose

This directory owns concrete database access for `public.embedding_cache` (Stage 12 Group 2), the
content-addressed embedding cache required by `AD-30`, `ENG-238`, and `SEC-322`: identical chunk
text at the same embedding strategy version is embedded once, not once per student.

Binding privacy constraint (quoted from `ENGINEERING-RULES.md` `ENG-238`): "the cache stores only
derived computation results keyed by content hash. It never stores the file, never an association
between students, and no cache entry is attributable to any student. Cache hits are invisible in
every student-facing surface."

This repository's contracts reflect that constraint at the type level: `DbEmbeddingCacheEntry`
carries no `studentId`, `resourceId`, or `chunkId`. Lookups and writes are keyed only by
`(contentHash, embeddingStrategyVersion)`.

## Public surface

- `@avora/db/repositories/embedding-cache`

## Requirement trace

- AD-30
- ENG-238
- SEC-322

## Boundaries

This repository must not import `@avora/domain`.

This repository must not import `@avora/retrieval`.

This repository must not import `@avora/ai`.

This repository must not import `@avora/adapters`.

This repository must not import `@avora/jobs`.

This repository must not import UI packages or apps.

This repository may use generated Supabase database types and role-scoped Supabase clients.

This repository owns concrete persistence access only. It does not implement embedding provider
calls, chunk embedding persistence (`@avora/db/repositories/chunk-embeddings`), vector search, a
cache eviction/TTL policy, worker orchestration, route handlers, UI, or mobile behavior.

`public.embedding_cache` carries no RLS policy for any client-reachable role (deny-by-default,
`ENG-304`). Only the service-role worker plane reads or writes this table, and it is never joined
into any student-facing query.
