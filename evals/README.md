# @avora/evals

Owner: @avora/ai  
Package type: test harness  
Publishable: no

## Purpose

`@avora/evals` is the AI evaluation harness package for Avora.

It owns the top-level evaluation directories used for grounding, citation, extraction, and assessment-validity gates.

Stage 4 Group 6 wires the first fail-closed citation-validity gate. It does not implement model calls, prompt execution, provider SDK usage, routing policy, retrieval implementation, AI behaviour, API handlers, database schema, Supabase logic, authentication, React components, React Native components, pages, or screens.

## Public surface

- `@avora/evals`
- `@avora/evals/suites`

## Requirement trace

- REPO-001
- REPO-003
- REPO-004
- ENG-011
- ENG-019
- ENG-218
- ENG-229
- NN-02
- NN-03
- NN-11
- NN-12

## Workspace dependencies

- `@avora/config`

## Harness directories

- `corpora/`
- `suites/`

## Gates

- `eval:ai` runs the AI evaluation gate harness.
- Citation validity is fail-closed.
- A cited chunk must exist in the supplied evidence set.
- A cited chunk must resolve to stored synthetic content with a locator.
- Evaluation fixtures in this stage are synthetic only.

## Boundaries

This package must not contain AI implementation, prompt implementation, provider SDK usage, model names, application features, business logic, API handlers, database schema, Supabase configuration, authentication implementation, React components, React Native components, pages, or screens.

Consented corpora and full AI evaluation suites remain later-stage work.

## Stage 10 Group 5 — Extraction quality eval suite

Stage 10 Group 5 adds a deterministic resource extraction quality gate.

The suite covers:

- normal extracted documents with sufficient synthetic coverage;
- partially extracted documents with usable content and honest warnings or page failures;
- scan and handwriting-style extraction success;
- unsupported-page honesty through existing warning and page-failure semantics;
- low-coverage extraction failure;
- fail-closed behavior when the suite has no cases.

The extraction quality suite evaluates synthetic extraction-result-shaped fixtures only. It does not call AI providers, OCR, storage, Supabase, databases, worker code, web APIs, mobile APIs, external services, or runtime extraction providers.

Run:

```text
pnpm --filter @avora/evals eval:extraction