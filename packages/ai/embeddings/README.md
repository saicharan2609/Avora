# embeddings

Owner: @avora/ai

## Purpose

This directory owns the provider-neutral embedding port for Stage 11 Group 4.

The embedding port is the narrow AI-owned boundary used by worker indexing code to request vectors for already-created retrieval chunks.

## Public surface

- `EmbeddingPort`
- `EmbeddingVector`
- `EmbeddingStrategyVersion`
- `EmbeddingTextInput`
- `EmbedTextsInput`
- `EmbedTextsResult`

## Requirement trace

- Stage 11 Group 4 — Embedding adapter seam and index job
- AIR-001
- AIR-002
- AIR-006
- AIR-013
- AD-15
- AD-18
- AD-19
- ENG-210
- ENG-215
- ENG-224
- ENG-225

## Boundary rules

This directory defines the port. It does not call providers directly.

Provider SDKs, API keys, model names, and vendor-specific request shapes must not appear in feature modules. Any provider integration must live behind this port and remain replaceable.

## Explicitly out of scope

Stage 11 Group 4 does not implement:

- vector search;
- scoped retrieval search;
- hybrid search;
- retrieval insufficiency;
- AI Tutor contracts;
- tutor orchestration;
- web APIs;
- mobile APIs;
- eval suites;
- e2e flows.

This group introduces the embedding seam and indexing handler only.