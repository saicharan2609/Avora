# resource-indexing

Owner: @avora/platform  
AI co-owner: @avora/ai

## Purpose

This worker-local module implements Stage 11 Group 4 resource indexing orchestration.

It reads ready retrieval chunks, sends their text through the AI-owned embedding port, and delegates persistence to an injected embedding index writer seam.

## Public surface

- `createResourceIndexingWorkerHandler`
- `resourceIndexingWorkerHandlerName`
- `ResourceIndexingWorkerInput`
- `ResourceIndexingWorkerResult`
- `ResourceIndexingWorkerDependencies`

## Requirement trace

- Stage 11 Group 4 — Embedding adapter seam and index job
- AD-18
- AD-19
- ENG-168
- ENG-224
- ENG-225

## Data flow

```text
IndexResourceJob
→ ready retrieval chunks
→ EmbeddingPort.embedTexts
→ embedding index writer seam