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

## Stage 9 Group 7 — Resource extraction worker completion harness

Stage 9 Group 7 adds a worker handler validation plan under:

- `src/resource-extraction/__tests__/resource-extraction-worker.plan.json`

The plan records expected worker handler behavior for extracted, partially extracted, failed, invalid job, invalid payload, and persistence failure cases.

This group does not change worker runtime behavior.
## Stage 11 Group 3 — Chunking pipeline

Stage 11 Group 3 adds a worker-local resource chunking composition module:

- `src/resource-chunking/`

The worker module composes existing extraction output, deterministic retrieval chunking, and the existing retrieval chunk repository.

Data flow:

```text
resource extraction document
+ extracted content blocks
→ @avora/retrieval/chunking
→ worker-local chunk mapper
→ retrieval chunk repository
## Stage 11 Group 4 — Resource indexing handler

Stage 11 Group 4 adds the worker-local resource indexing handler.

New module:

- `src/resource-indexing/`

The handler reads ready retrieval chunks, requests embeddings through `@avora/ai/embeddings`, and delegates embedding persistence to an injected embedding index writer seam.

This group does not add a claim loop, queue infrastructure, database schema, RLS policy, repository implementation, vector search, scoped retrieval search, hybrid search, AI Tutor orchestration, web APIs, mobile APIs, evals, or e2e flows.

## Pre-Stage-12 readiness exception — bootstrap and lifecycle logging

Owner decision (2026-08-23): Process startup and shutdown lifecycle logging in `src/main.ts` and `src/runtime/shutdown.ts` is an explicitly approved bootstrap/lifecycle console logging exception while `LoggerContract` implementation is pending. No-console remains strictly enforced across all domain, service, and handler logic.

## Stage 12 Group 7 — Resource summary generation worker handler

Stage 12 Group 7 adds the worker-plane resource summary generation handler (`FR-070`).

New worker-local module:

- `src/resource-summary/`

The handler consumes a claimed `resource_summary_jobs` row, generates a summary via `SummaryGatewayPort` (`@avora/ai`), and persists it through `ResourceSummariesRepository` (`@avora/db/repositories/resource-summaries`). See `src/resource-summary/README.md` for the full data flow and idempotency notes.

**This group does not modify `src/runtime/**`, `src/main.ts`, the claim loop, checkpoint/shutdown infrastructure, or `createWorkerRuntime.ts`.** `createResourceSummaryWorkerHandler`, `createResourceSummaryJobHandlerAdapter`, and `createResourceSummaryWorker` are complete and independently testable but are left uncomposed — composition-root wiring and claim-loop activation for every worker handler, this one included, is explicitly owned by Stage 12 Group 13, mirroring the same boundary already documented for the tutor answer adapter in the "Phase E" section of `packages/ai/README.md`.

**Correction — Worker Runtime Activation group:** the preceding paragraph is preserved as written at the time Group 7 landed. Composition-root wiring and claim-loop activation, including composing `resourceSummaryWorker` into `WorkerRuntime`, have since been implemented directly (`src/main.ts`, `src/runtime/claim-loop.ts`, `src/runtime/createWorkerRuntime.ts`) rather than deferred to Stage 12 Group 13, because the activation work has no technical dependency on Groups 8–12 and was blocking every already-implemented job handler from ever executing. Every composed worker's own job-handler logic (this one included) is unchanged.