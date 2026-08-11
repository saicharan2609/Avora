# chunking

Owner: @avora/ai

## Purpose

This directory owns retrieval chunking contracts and, in later groups, retrieval chunking mechanics.

Stage 10 Group 1 adds vendor-free contracts for locator-preserving, structure-aware, versioned retrieval chunks.

## Public surface

- `@avora/retrieval/chunking`

## Requirement trace

- AD-18
- AD-19
- AIR-002
- ENG-221
- ENG-222
- ENG-224
- ENG-225
- ENG-226
- ENG-227

## Boundaries

This directory may import `@avora/core`.

This directory must not import `@avora/domain`.

This directory must not import `@avora/ai`.

This directory must not import `@avora/adapters`.

This directory must not import `@avora/jobs`.

This directory must not import apps, UI packages, feature modules, or provider SDKs.

## Stage 10 Group 1 scope

This group defines contracts only.

It does not add database persistence, migrations, repositories, embeddings, vector search, keyword search, hybrid search, scope resolution runtime, insufficiency thresholds, AI Gateway context assembly, citation verification, worker execution, web routes, UI, mobile screens, or E2E flows.