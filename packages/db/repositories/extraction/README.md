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