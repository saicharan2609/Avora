# @avora/worker

Owner: @avora/platform  
Package type: application  
Deployable: container worker  
Publishable: no

## Purpose

`@avora/worker` is the Avora worker-plane runtime.

It owns background job runtime composition and service-role execution boundaries.

Stage 7 Group 9 connected the worker runtime to durable resource ingestion jobs. The worker can claim queued jobs, heartbeat active claims, and release them for later processing.

Stage 7 Group 10 validates claimed resource ingestion jobs. The worker verifies resource ownership, lifecycle state, storage location, content hash, byte size, MIME type, and storage object existence before transitioning the resource to `processing` or `rejected`.

This group does not implement OCR, parsing, extraction, AI processing, embeddings, retrieval indexing, summaries, flashcards, quizzes, UI, mobile, or API routes.

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

- `@avora/adapters`
- `@avora/core`
- `@avora/db`
- `@avora/domain`
- `@avora/jobs`
- `@avora/config`

## Boundaries

This app may use service-role credentials.

This app must not accept client input.

This app must not import `apps/web` or `apps/mobile`.

This app must not import `@avora/ui-web` or `@avora/ui-mobile`.

This app must not import `@avora/ai` or `@avora/retrieval` in Stage 7 Group 10.

Resource extraction belongs to a later stage.

## Stage 9 Group 6 — Resource extraction worker handler

Stage 9 Group 6 adds the worker-plane resource extraction handler.

New worker-local module:

- `src/resource-extraction/`

The handler consumes `ResourceExtractionJobRequest` from `@avora/jobs/resource-extraction`, maps the job payload into a domain `ResourceExtractionRequest`, invokes `ResourceExtractionService`, and persists successful or partially successful extraction output through `ResourceExtractionRepository`.

The handler does not claim jobs, acknowledge jobs, update resource status, parse files, inspect storage, call OCR adapters, call AI adapters, create embeddings, index retrieval chunks, expose API routes, or implement UI/mobile behavior.

The handler must be composed by worker runtime code with already-constructed dependencies.