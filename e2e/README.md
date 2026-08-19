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
- `test:resource-extraction` runs the Stage 10 Group 7 resource extraction e2e harness.
- The suites must not be skipped, marked pending, or weakened.
- The suites use synthetic fixtures only.

## Boundaries

This package must not contain application features, business logic, API handlers, database schema, Supabase configuration, authentication implementation, AI implementation, React components, React Native components, pages, or screens.

End-to-end critical flows and load simulation are added only as explicitly staged deterministic harnesses.

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

## Stage 9 Group 6 — Resource placement correction flow

Stage 9 Group 6 adds the resource placement correction flow plan under:

- `flows/resource-placement/`
- `fixtures/resource-placement.fixture.json`

The flow covers resource upload, upload completion, validated ingestion, classification request handoff, persisted placement candidate reads, accepting an existing placement candidate by `candidateId`, placement correction, academic-unit placement listing, and cross-student denial.

This flow uses synthetic fixtures only.

This flow must not use production data, real student content, real academic material, service-role credentials, direct runtime imports, direct database repository imports, runtime classifier execution, worker execution, AI behavior, retrieval behavior, UI behavior, or mobile behavior.

## Stage 9 Group 7 — Resource extraction flow plan

Stage 9 Group 7 added the historical resource extraction completion flow plan under:

- `flows/resource-extraction/resource-extraction.flow-plan.json`
- `fixtures/resource-extraction.fixture.json`

The Stage 9 plan is retained as historical planning context only. Stage 10 Group 7 supersedes it with an executable deterministic harness.

## Stage 10 Group 7 — Resource extraction e2e harness

Stage 10 Group 7 adds an executable deterministic resource extraction harness under:

- `flows/resource-extraction/resource-extraction.fixture.ts`
- `flows/resource-extraction/resource-extraction.e2e.ts`
- `flows/resource-extraction/run-resource-extraction-flow.ts`

The harness proves:

- a synthetic uploaded resource can be represented as a resource extraction job;
- extraction reaches the domain extraction service through a deterministic extraction port;
- extraction output is persisted into in-memory implementations of the real repository contracts;
- successful extraction converges resource lifecycle to `ready`;
- partially extracted output persists usable content and unsupported-page failure metadata;
- partially extracted output converges resource lifecycle to `ready` while public processing status remains `partially_ready`;
- terminal failed extraction persists failed document/failure semantics and converges status to `failed`.

This harness uses synthetic fixtures only.

This harness must not use production data, real student content, service-role credentials, real Supabase databases, real storage, OCR, parser adapters, provider SDK calls, model calls, embeddings, retrieval indexing, summaries, notes, flashcards, quizzes, API routes, UI, or mobile behavior.

Run:

```text
pnpm --filter @avora/e2e test:resource-extraction