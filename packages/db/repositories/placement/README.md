# placement repository

Owner: @avora/data

## Purpose

This directory owns resource placement persistence for Completion Group B.

It persists accepted/tentative resource placement rows and placement correction history using the existing student-scoped DB repository pattern.

## Public surface

- `createResourcePlacementRepository`
- `ResourcePlacementRepository`
- `DbResourcePlacementRecord`
- `DbPlacementCorrectionRecord`

## Tables

- `public.resource_placements`
- `public.resource_placement_corrections`

## Boundaries

This repository is database-shaped.

It does not import placement services, classification workers, AI, retrieval, apps, UI packages, provider SDKs, `@avora/domain`, or Stage 11 tutor behavior.

All reads and writes are scoped by `student_id`.
## Compatibility correction — candidate queries and academic-unit listing

This repository also persists and reads server-generated placement candidates through `public.resource_placement_candidates`.

The candidate query surface exists so later web/API transport can read and accept existing candidates by `candidateId` without trusting a client-supplied `PlacementCandidate`.

The academic-unit listing surface lists existing placed resource placements by term, subject, or structure unit through the placement table.