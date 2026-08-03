# @avora/evals

Owner: @avora/ai  
Package type: test harness  
Publishable: no

## Purpose

`@avora/evals` is the AI evaluation harness package for Avora.

It owns the top-level evaluation directories used for grounding, citation, extraction, and assessment-validity gates. Stage 3 creates only the workspace package shell, TypeScript wiring, README, empty public TypeScript surface, and tracked canonical directories.

## Public surface

- `@avora/evals`

## Requirement trace

- REPO-001
- REPO-003
- REPO-004
- ENG-011
- ENG-019
- NN-02
- NN-03
- NN-11
- NN-12

## Workspace dependencies

- `@avora/config`

## Harness directories

- `corpora/`
- `suites/`

## Boundaries

This package must not contain AI implementation, prompt implementation, provider SDK usage, model names, application features, business logic, API handlers, database schema, Supabase configuration, authentication implementation, React components, React Native components, pages, or screens.

Stage 3 does not implement evaluation suites or corpora.