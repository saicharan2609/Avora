# extraction repository

Owner: @avora/data

## Purpose

This directory owns concrete database access for resource extraction output.

Stage 9 Group 3 adds repositories for:

- resource extraction documents;
- extracted content blocks;
- hierarchical extracted content block reads.

## Public surface

- `@avora/db/repositories/extraction`

## Requirement trace

- REPO-003
- REPO-004
- ENG-011
- ENG-013
- ENG-016
- ENG-018
- FR-032
- FR-035
- FR-036
- FR-037
- FR-039
- FR-042
- NFR-004
- NFR-034
- NN-04
- NN-05
- NN-10

## Boundaries

This repository must not import `@avora/domain`.

This repository must not import `@avora/adapters`.

This repository must not import `@avora/jobs`.

This repository must not import `@avora/ai`.

This repository must not import `@avora/retrieval`.

This repository must not import UI packages or apps.

This repository may use generated Supabase database types and role-scoped Supabase clients.

This repository owns concrete persistence access only. Extraction execution, parsing, OCR, chunking, AI, embeddings, and retrieval indexing belong to later groups.

## Stage 9 Group 7 — Repository validation plan

Stage 9 Group 7 adds:

- `__tests__/resource-extraction-repository.plan.json`

The plan records repository expectations for creating extraction documents, creating extracted content blocks, reading extraction documents, listing blocks, and building extracted content block trees.

The plan also records boundary assertions that the repository must not import domain, jobs, adapters, AI, retrieval, apps, or UI packages.
## Stage 10 Group 2 — Extraction schema and repositories

Stage 10 Group 2 extends extraction persistence with extracted pages, extraction failures, and extraction provenance.

The repository remains DB-shaped and does not import `@avora/domain`.

The persistence layer remains student-scoped through `student_id`, composite extraction-document ownership constraints, and RLS.

This group does not add worker execution, storage adapters, OCR, parsing, AI behavior, retrieval indexing, API routes, UI, or mobile behavior.
## Stage 10 Group 4 — Extraction document checkpoint

Stage 10 Group 4 adds the DB-backed idempotency primitive required before the worker extraction handler can safely checkpoint extraction-document persistence.

The checkpoint key is:

- `student_id`
- `resource_id`
- `extraction_strategy_version`
- `chunking_strategy_version`

The repository exposes:

- `createResourceExtractionDocumentCheckpoint`

The method creates the extraction document when no checkpoint exists, or returns the existing extraction document for the same checkpoint key.

This primitive is intentionally limited to extraction document checkpointing. It does not implement worker execution, page persistence, provenance persistence, failure persistence, child-row idempotency, storage adapters, OCR, parsing, AI behavior, retrieval indexing, API routes, UI, mobile behavior, RLS changes, or production data cleanup.