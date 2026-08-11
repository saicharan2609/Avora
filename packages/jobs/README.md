# @avora/jobs

Owner: @avora/platform  
Package type: library  
Publishable: no

## Purpose

`@avora/jobs` owns job-plane contracts, queue-facing handoff types, claim seams, checkpoint seams, heartbeat seams, priority metadata, state-machine seams, and dead-letter seams.

Stage 4 Group 5 established the package structure.

Stage 7 Group 7 introduced the resource ingestion job handoff contract. This allows upload completion to request future worker-side ingestion without executing ingestion during the HTTP request.

Stage 7 Group 8 introduced durable resource ingestion job persistence contracts.

Stage 7 Group 9 introduces resource ingestion claim-loop types used by the worker runtime.

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
- Resource ingestion claim-loop contract

## Boundaries

This package must not import `@avora/domain`.

This package must not import `@avora/db`.

This package must not import `@avora/adapters`.

This package must not import `@avora/ui-web` or `@avora/ui-mobile`.

This package must not import `@avora/ai` or `@avora/retrieval`.

This package must not contain worker execution, queue persistence implementation, database migrations, storage SDK behavior, OCR, malware scanning, file parsing, AI processing, embeddings, retrieval indexing, React components, React Native components, pages, screens, or tests in Stage 7 Group 9.

Job handoff contracts describe work to be executed later by the worker plane.

## Stage 9 Group 5 — Resource extraction job handoff

Stage 9 Group 5 adds job contracts for resource extraction handoff.

New public surface:

- `@avora/jobs/resource-extraction`

New job name:

- `resource.extraction.extract`

New queue port:

- `ResourceExtractionQueuePort`

This group allows later worker-plane code to enqueue extraction work after a resource passes validation and enters `processing`.

This group does not add worker execution, database repository composition, extraction adapters, OCR, parsing, AI, embeddings, retrieval indexing, API routes, UI, mobile behavior, or e2e flows.s

## Stage 9 Group 7 — Resource extraction job handoff traceability

Stage 9 Group 7 adds final completion traceability for the resource extraction job handoff.

The completion harness validates that `ResourceExtractionJobRequest`, `resourceExtractionJobName`, and the job payload contract are consumed by the worker handler validation plan.

No jobs package runtime behavior is changed in this group.