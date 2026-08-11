# @avora/e2e

Owner: @avora/qa  
Structural adaptivity owner: @avora/architecture  
Package type: test harness  
Publishable: no

## Purpose

`@avora/e2e` is the cross-cutting harness package for Avora.

It owns the top-level end-to-end harness directories that do not belong beside a single package.

Stage 4 Group 6 wires the first always-on structural adaptivity gate. It does not implement product flows, browser automation, mobile automation, load simulation, API tests, database tests, Supabase tests, authentication tests, AI behaviour, React components, React Native components, pages, or screens.

## Public surface

- `@avora/e2e`
- `@avora/e2e/adaptivity`

## Requirement trace

- REPO-001
- REPO-003
- REPO-004
- REPO-020
- ENG-011
- ENG-019
- ENG-341
- ENG-342
- NN-01
- NN-12

## Workspace dependencies

- `@avora/config`

## Harness directories

- `flows/`
- `adaptivity/`
- `load/`
- `fixtures/`

## Gates

- `test:adaptivity` runs the structural adaptivity suite.
- The suite must not be skipped, marked pending, or weakened.
- The suite uses synthetic fixtures only.

## Boundaries

This package must not contain application features, business logic, API handlers, database schema, Supabase configuration, authentication implementation, AI implementation, React components, React Native components, pages, or screens.

End-to-end critical flows and load simulation remain later-stage work.

## Stage 7 Group 11 — Resource ingestion validation flow

Stage 7 Group 11 adds the resource ingestion validation flow plan under:

- `flows/resource-ingestion/`
- `fixtures/resource-ingestion.fixture.json`

The flow covers upload intent, upload completion, durable job persistence, worker claim, validation, resource state transition, job terminal state, and cross-student denial.

This flow uses synthetic fixtures only.

This flow must not use production data, service-role credentials, direct database repository imports, OCR, parsing, AI, embeddings, retrieval, UI, or mobile behavior.

## Stage 8 Group 7 — Academic setup flow

Stage 8 Group 7 adds the academic setup flow plan under:

- `flows/academic-setup/`
- `fixtures/academic-setup.fixture.json`

The flow covers authenticated setup progress reads, academic term creation, subject creation, recursive structure-unit creation, academic tree reads, and cross-student denial.

This flow uses synthetic fixtures only.

This flow must not use production data, service-role credentials, direct database repository imports, UI behavior, mobile behavior, worker behavior, AI behavior, or retrieval behavior.
## Stage 9 Group 7 — Resource extraction flow

Stage 9 Group 7 adds the resource extraction completion flow under:

- `flows/resource-extraction/`
- `fixtures/resource-extraction.fixture.json`

The flow covers resource extraction job handoff, worker handler validation, domain extraction service invocation, extraction repository persistence, source locator preservation, parent-child extracted block hierarchy, and RLS expectations.

This flow uses synthetic fixtures only.

This flow must not use production data, real student content, service-role credentials, direct runtime imports, OCR adapters, parser adapters, AI adapters, embeddings, retrieval indexing, API routes, UI, or mobile behavior.