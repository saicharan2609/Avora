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
```

## Stage 12 Group 3 — Hybrid retrieval search

Stage 12 Group 3 adds `createHybridRetrievalSearch`, a second `RetrievalSearchPort` implementation that performs the real hybrid (dense vector + keyword, Reciprocal Rank Fusion) search architecture.md section 17.4 specifies, instead of `createScopedRetrievalSearch`'s unranked scope listing.

New public surface:

- `createHybridRetrievalSearch`
- `EmbedQueryText`, `EmbedQueryTextInput`
- `CreateHybridRetrievalSearchInput`

Data flow:

```text
ScopedSearchInput
→ resolveScopedSearchPredicate
→ embedQueryText(query)                                  // injected, not owned here
→ RetrievalChunkRepository.searchRetrievalChunksHybrid    // pre-filtered, RRF-ranked
→ RetrievalSearchResult[]
→ RetrievalInsufficiency | RetrievalSufficiency
```

`embedQueryText` is an injected, structurally-typed function (`(input: { queryText: string }) => Promise<readonly number[]>`), not an import of `@avora/ai`'s `EmbeddingPort` — this package must not import `@avora/ai` or hold a provider SDK (NN-02). The composition root (e.g. `apps/web/app/api/tutor/_shared/composition.ts`) adapts the concrete `EmbeddingPort` to this shape.

`availableChunkCount` for insufficiency purposes is the number of chunks the hybrid search actually ranked and returned (bounded by `limits.maxChunks`), not a raw count of everything in scope. This is a deliberate correction over `createScopedRetrievalSearch`'s scope-size-only threshold: a scope with hundreds of chunks on unrelated topics should not count as "sufficient" for a query none of them answer (ENG-226, architecture.md section 17.4's "no candidate above threshold" path).

`createScopedRetrievalSearch` is unchanged and still exported — it remains available as the unranked scope-listing implementation of the same port.