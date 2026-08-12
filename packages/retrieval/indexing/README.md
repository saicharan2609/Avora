# indexing

Owner: @avora/ai

## Purpose

This directory owns retrieval indexing contracts for Stage 11 Group 4.

Stage 11 Group 4 introduces the `IndexResourceJob` contract used by the worker plane to embed already-created retrieval chunks.

## Public surface

- `IndexResourceJob`
- `IndexResourceJobPayload`
- `indexResourceJobName`

## Requirement trace

- Stage 11 Group 4 — Embedding adapter seam and index job
- AD-18
- AD-19
- ENG-168
- ENG-224
- ENG-225

## Boundaries

This directory does not implement vector search, scoped retrieval search, hybrid search, insufficiency, AI Gateway behavior, tutor contracts, or provider calls.

It also does not import `@avora/ai`. Retrieval owns the job contract; the AI package owns the embedding port.