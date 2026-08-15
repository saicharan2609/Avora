# extraction adapter

Owner: @avora/platform

## Purpose

This directory owns the Stage 10 Group 3 extraction adapter seam.

It exposes provider-specific adapter factory names for:

- document extraction;
- scan extraction;
- handwriting extraction.

The factories adapt provider-shaped extraction implementations to the domain-owned `ExtractionPort`.

## Public surface

- `@avora/adapters/extraction`
- `createDocumentExtractionAdapter`
- `createScanExtractionAdapter`
- `createHandwritingExtractionAdapter`

## Boundaries

This adapter may import:

- `@avora/domain/resources`

This adapter must not import:

- `@avora/db`
- `@avora/ai`
- `@avora/retrieval`
- `@avora/jobs`
- apps
- UI packages
- mobile packages

This adapter does not implement provider SDK calls, OCR, parsing, handwriting recognition, scan processing, storage access, persistence, RLS, worker execution, API routes, AI behavior, retrieval behavior, UI, or mobile code.

Provider implementations must be supplied from approved adapter-owned directories and must satisfy the provider interfaces structurally.