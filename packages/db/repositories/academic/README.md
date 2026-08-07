# academic repository

Owner: @avora/data

## Purpose

This directory owns concrete database access for the student-owned academic graph.

Stage 8 Group 3 adds repositories for:

- academic terms;
- subjects;
- recursive structure units;
- academic structure tree reads.

## Public surface

- `@avora/db/repositories/academic`

## Requirement trace

- REPO-003
- REPO-004
- ENG-011
- ENG-013
- ENG-016
- ENG-018
- FR-001
- FR-002
- FR-003
- FR-004
- FR-005
- NFR-004
- NFR-034
- NN-04
- NN-05
- NN-10

## Boundaries

This repository must not import `@avora/domain`.

This repository must not import `@avora/ai`.

This repository must not import `@avora/retrieval`.

This repository must not import UI packages or apps.

This repository may use generated Supabase database types and role-scoped Supabase clients.

This repository owns concrete persistence access only. Academic setup orchestration belongs to a later Stage 8 group.