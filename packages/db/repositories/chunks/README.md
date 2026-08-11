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

This repository owns concrete persistence access only. Chunking algorithms, scope resolution runtime, embeddings, vector search, keyword search, hybrid retrieval, insufficiency, AI Gateway context assembly, citation verification, worker execution, route handlers, UI, and mobile behavior belong to later groups.