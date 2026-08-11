# resource extraction worker handler

Owner: @avora/worker  
Domain owner: @avora/resources  
Data owner: @avora/data

## Purpose

This directory owns the worker-plane handler for Stage 9 resource extraction jobs.

Stage 9 Group 6 consumes the job handoff contract from `@avora/jobs/resource-extraction`, invokes the domain extraction service from `@avora/domain/resources`, and persists successful or partially successful extraction output through `@avora/db/repositories/extraction`.

## Public surface

This is an app-local worker module.

It is re-exported from:

- `apps/worker/src/index.ts`

## Consumes

- `ResourceExtractionJobRequest`
- `resourceExtractionJobName`
- `ResourceExtractionService`
- `ResourceExtractionRepository`

## Does not own

This handler does not own job claiming, queue polling, queue acknowledgement, resource status transitions, concrete OCR, parsing, AI model calls, embedding, retrieval indexing, summaries, notes, flashcards, quizzes, web routes, UI, or mobile behavior.

## Boundaries

This directory must not import `@avora/adapters`.

This directory must not import `@avora/ai`.

This directory must not import `@avora/retrieval`.

This directory must not import apps/web or apps/mobile.

This directory must not import UI packages.

This directory must not import `@supabase/supabase-js` directly.

Concrete runtime composition must pass in already-constructed domain services and repositories.