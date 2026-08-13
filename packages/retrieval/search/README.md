# search


## Purpose

This directory owns scoped retrieval search for Stage 11 Group 5.

The search implementation resolves the requested student and academic scope, reads ready retrieval chunks through the existing DB repository, returns deterministic scoped results, and reports retrieval insufficiency when scoped context is missing or too small.

## Public surface

- `RetrievalSearchPort`
- `ScopedSearchResult`
- `RetrievalSearchResult`
- `createScopedRetrievalSearch`

## Requirement trace

- Stage 11 Group 5 — Scoped retrieval search

## Data flow

```text
ScopedSearchInput
→ resolveScopedSearchPredicate
→ RetrievalChunkRepository.listRetrievalChunksByScope
→ RetrievalSearchResult[]
→ RetrievalInsufficiency | RetrievalSufficiency