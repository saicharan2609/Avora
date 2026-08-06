# @avora/worker

Owner: @avora/platform  
Package type: application  
Deployable: container worker  
Publishable: no

## Purpose

`@avora/worker` is the Avora worker-plane runtime.

It owns background job runtime composition and service-role execution boundaries.

Stage 7 Group 9 connects the worker runtime to durable resource ingestion jobs. The worker can claim queued jobs, heartbeat active claims, and release them for later processing.

This group does not implement resource validation, OCR, parsing, extraction, AI processing, embeddings, retrieval indexing, summaries, flashcards, quizzes, UI, mobile, or API routes.

## Public surface

This application has no package export surface.

Its runtime surfaces are:

- `src/index.ts`
- `src/runtime/`
- `src/resource-ingestion/`

## Requirement trace

- REPO-003
- REPO-004
- ENG-011
- ENG-013
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
- SEC-040
- SEC-081
- SEC-082
- SEC-230
- SEC-231

## Workspace dependencies

- `@avora/core`
- `@avora/db`
- `@avora/jobs`
- `@avora/config`

## Boundaries

This app may use service-role credentials.

This app must not accept client input.

This app must not import `apps/web` or `apps/mobile`.

This app must not import `@avora/ui-web` or `@avora/ui-mobile`.

This app must not import `@avora/ai` or `@avora/retrieval` in Stage 7 Group 9.

Resource ingestion execution belongs to Stage 7 Group 10.