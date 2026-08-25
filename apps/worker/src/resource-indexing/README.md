# resource-indexing

Owner: @avora/platform  
AI co-owner: @avora/ai

## Purpose

This worker-local module implements Stage 11 Group 4 resource indexing orchestration, and Stage 12
Group 2 fills the previously injected persistence seam with a concrete implementation.

It reads ready retrieval chunks, sends their text through the AI-owned (content-addressed-cached,
Stage 12 Group 2) embedding port, and persists the resulting vectors to `public.chunk_embeddings`
through `createSupabaseEmbeddingIndexWriter`.

## Public surface

- `createResourceIndexingWorkerHandler`
- `resourceIndexingWorkerHandlerName`
- `ResourceIndexingWorkerInput`
- `ResourceIndexingWorkerResult`
- `ResourceIndexingWorkerDependencies`
- `createSupabaseEmbeddingIndexWriter` (Stage 12 Group 2)

## Requirement trace

- Stage 11 Group 4 — Embedding adapter seam and index job
- Stage 12 Group 2 — Embedding generation & vector indexing
- AD-18
- AD-19
- AD-30
- ENG-168
- ENG-171
- ENG-224
- ENG-225
- ENG-238
- SEC-290

## Data flow

```text
IndexResourceJob
→ ready retrieval chunks
→ EmbeddingPort.embedTexts (content-addressed cached, Stage 12 Group 2)
→ createSupabaseEmbeddingIndexWriter → ChunkEmbeddingsRepository.writeChunkEmbeddings
→ public.chunk_embeddings