# insufficiency

## Purpose

This directory owns retrieval insufficiency contracts for Stage 11 Group 5.

Retrieval insufficiency is emitted when scoped retrieval does not find enough context for downstream grounded answer generation.

## Public surface

- `RetrievalInsufficiency`
- `RetrievalSufficiency`
- `RetrievalSufficiencyDecision`
- `createRetrievalInsufficiency`
- `createRetrievalSufficiency`

## Requirement trace

- Stage 11 Group 5 — Scoped retrieval search

## Boundaries

This directory does not call AI models, generate fallback copy, decide tutor behavior, validate citations, or perform provider orchestration.

Those responsibilities belong to later Stage 11 groups.