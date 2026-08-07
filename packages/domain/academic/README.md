# academic

Owner: @avora/academic  
Package type: domain module  
Publishable: no

## Purpose

The `academic` module owns vendor-free academic structure contracts.

Stage 8 Group 1 establishes the first academic graph contract surface:

- academic terms;
- subjects;
- recursive structure units;
- academic structure paths;
- academic structure trees;
- placement confidence.

This module does not own persistence, route handlers, UI, worker behavior, AI behavior, retrieval behavior, or tests in Stage 8 Group 1.

## Public surface

- `@avora/domain/academic`

## Requirement trace

- REPO-007
- ENG-011
- ENG-015
- ENG-016
- ENG-018
- FR-001
- FR-002
- FR-003
- FR-004
- FR-005
- FR-032
- FR-035
- NFR-004
- NFR-034
- NN-04
- NN-05
- NN-10

## Internal layers

- `contracts/`

## Current contracts

- `AcademicTermRecord`
- `SubjectRecord`
- `StructureUnitRecord`
- `AcademicStructurePath`
- `AcademicStructureTree`
- `PlacementConfidence`

## Boundaries

This module must not import `@avora/db`.

This module must not import `@avora/adapters`.

This module must not import `@avora/jobs`.

This module must not import `@avora/ai`.

This module must not import `@avora/retrieval`.

This module must not import UI packages or apps.

This module may import shared identity and time primitives from `@avora/core`.

Database schema, RLS, generated types, and repositories belong to later Stage 8 groups.