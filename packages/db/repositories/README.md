# repositories

Owner: @avora/data

## Purpose

This directory owns concrete Supabase repository implementations.

Repositories in this package execute through role-scoped Supabase clients and map database rows into package-owned records.

## Current repositories

- `resources`
- `jobs`

## Public surface

- `@avora/db/repositories`
- `@avora/db/repositories/resources`
- `@avora/db/repositories/jobs`

## Boundaries

Repositories in `@avora/db` must not import `@avora/domain`.

Repositories in `@avora/db` must not import `@avora/ai`, `@avora/retrieval`, UI packages, or apps.

Repositories in `@avora/db` must not implement domain invariants, route handlers, workers, storage SDK behavior, AI behavior, retrieval behavior, React components, React Native components, pages, or screens.

## Stage 8 Group 3 — Academic graph repository

Stage 8 Group 3 adds:

- `academic/`

The academic repository owns concrete database access for `public.academic_terms`, `public.subjects`, and `public.structure_units`.

It must not import `@avora/domain`.

Academic setup orchestration belongs to a later Stage 8 group.

## Stage 9 Group 3 — Resource extraction repository

Stage 9 Group 3 adds:

- `extraction/`

The extraction repository owns concrete database access for `public.resource_extraction_documents` and `public.resource_extracted_content_blocks`.

It must not import `@avora/domain`.

Extraction execution, parsing, OCR, AI processing, embeddings, and retrieval indexing belong to later groups.
## Stage 10 Group 3 — Retrieval chunk repository

Stage 10 Group 3 adds:

- `chunks/`

The chunks repository owns concrete database access for `public.chunks`.

It must not import `@avora/retrieval`, `@avora/domain`, `@avora/jobs`, `@avora/ai`, adapters, apps, or UI packages.

Retrieval mechanics, chunking algorithms, scope resolution runtime, embeddings, hybrid search, insufficiency, AI Gateway context assembly, and citation verification belong to later groups.

## Stage 12 Group 2 — Chunk embeddings and content-addressed embedding cache repositories

Stage 12 Group 2 adds:

- `chunk-embeddings/`
- `embedding-cache/`

The chunk-embeddings repository owns concrete database access for `public.chunk_embeddings`,
versioned per embedding strategy. The embedding-cache repository owns concrete database access for
`public.embedding_cache`, the AD-30 / ENG-238 / SEC-322 content-addressed embedding cache, which
carries no student attribution by design.

Neither repository must import `@avora/retrieval`, `@avora/domain`, `@avora/jobs`, `@avora/ai`, adapters, apps, or UI packages.

Embedding provider calls, the content-addressed cache decorator (`@avora/ai/embeddings`), vector
search, hybrid search, retrieval insufficiency, AI Gateway context assembly, and citation
verification belong to `@avora/ai`, `@avora/retrieval`, and later groups.