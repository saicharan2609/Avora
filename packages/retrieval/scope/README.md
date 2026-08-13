# scope

## Purpose

This directory owns scoped retrieval input contracts for Stage 11 Group 5.

Scoped retrieval must resolve the student and academic scope before any retrieval search result is assembled. The resolved predicate is passed directly to the existing chunk repository so retrieval is pre-filtered by student and scope.

## Public surface

- `ScopedSearchInput`
- `ScopedSearchScope`
- `ResolvedScopedSearchPredicate`
- `resolveScopedSearchPredicate`

## Requirement trace

- Stage 11 Group 5 — Scoped retrieval search

## Data flow

```text
ScopedSearchInput
→ resolveScopedSearchPredicate
→ RetrievalChunkRepository.listRetrievalChunksByScope