# @avora/jobs

Owner: @avora/platform  
Package type: library  
Publishable: no

## Purpose

`@avora/jobs` owns job-plane contracts, queue-facing handoff types, claim seams, checkpoint seams, heartbeat seams, priority metadata, state-machine seams, and dead-letter seams.

Stage 4 Group 5 established the package structure.

Stage 7 Group 7 introduced the resource ingestion job handoff contract. This allows upload completion to request future worker-side ingestion without executing ingestion during the HTTP request.

Stage 7 Group 8 introduces durable resource ingestion job persistence contracts. These contracts describe queued resource ingestion jobs persisted by `@avora/db` while keeping worker claim and execution for later groups.

## Public surface

- `@avora/jobs`
- `@avora/jobs/ports`
- `@avora/jobs/queue`
- `@avora/jobs/state-machines`
- `@avora/jobs/claim`
- `@avora/jobs/checkpoint`
- `@avora/jobs/heartbeat`
- `@avora/jobs/priorities`
- `@avora/jobs/dead-letter`

## Requirement trace

- REPO-003
- REPO-004
- ENG-011
- ENG-013
- ENG-015
- ENG-016
- ENG-018
- ENG-176
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

## Workspace dependencies

- `@avora/core`
- `@avora/config`

## Current job handoff contracts

- Resource ingestion job handoff
- Durable resource ingestion job persistence contract

## Boundaries

This package must not import `@avora/domain`.

This package must not import `@avora/db`.

This package must not import `@avora/adapters`.

This package must not import `@avora/ui-web` or `@avora/ui-mobile`.

This package must not import `@avora/ai` or `@avora/retrieval`.

This package must not contain worker execution, queue persistence implementation, database migrations, storage SDK behavior, OCR, malware scanning, file parsing, AI processing, embeddings, retrieval indexing, React components, React Native components, pages, screens, or tests in Stage 7 Group 8.

Job handoff contracts describe work to be executed later by the worker plane.