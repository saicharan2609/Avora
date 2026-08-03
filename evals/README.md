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