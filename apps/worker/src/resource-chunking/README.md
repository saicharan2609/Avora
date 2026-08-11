# resource-chunking

Owner: @avora/platform

## Purpose

This worker-local module composes the Stage 11 Group 3 chunking pipeline.

It reads persisted extraction output, invokes the deterministic resource chunker from `@avora/retrieval/chunking`, maps the resulting retrieval-layer chunk creation inputs to the existing database repository shape, and persists retrieval chunks through the existing chunk repository.

## Public surface

- `createResourceChunkingWorkerHandler`
- `resourceChunkingWorkerHandlerName`
- `ResourceChunkingWorkerInput`
- `ResourceChunkingWorkerResult`
- `ResourceChunkingWorkerDependencies`
- `ResourceChunkingWorkerError`

## Requirement trace

- Stage 11 Group 3 — Chunking pipeline
- AIR-001
- AIR-002
- AIR-006
- AD-18
- AD-19
- ENG-168
- ENG-222
- ENG-224
- ENG-225

## Data flow

```text
resource_extraction_documents
+ resource_extracted_content_blocks
→ deterministic resource chunker
→ retrieval CreateRetrievalChunkInput[]
→ worker-local mapper
→ RetrievalChunkRepository.createRetrievalChunks