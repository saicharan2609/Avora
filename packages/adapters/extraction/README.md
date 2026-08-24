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
- `createPdfExtractionAdapter`
- `createVisionExtractionAdapter`
- `createCompositeResourceExtractionAdapter`
- `sanitizeExtractedText`
- `sanitizeExtractedContentBlocks`

## Stage 12 Group 1 — Concrete Extraction Adapters & Sanitization

Stage 12 Group 1 implements concrete extraction adapters satisfying `ResourceExtractionPort`:

1. `pdf/`: Structural digital PDF text parser and extractor (`createPdfExtractionAdapter`, `parsePdfStructure`).
2. `vision/`: Multimodal OCR/Vision extractor for scanned notes and Xerox copies (`createVisionExtractionAdapter`).
3. `sanitization/`: Text block sanitization enforcing `SEC-281` and `ENG-222` (HTML/script injection stripping, control character removal, Unicode NFKC normalization, LaTeX math preservation).
4. `composite/`: Unified MIME-routed extraction adapter with fallback from empty digital PDF to vision OCR (`createCompositeResourceExtractionAdapter`).

## Boundaries

This adapter may import:

- `@avora/domain/resources`
- `@avora/core`

This adapter must not import:

- `@avora/db`
- `@avora/retrieval`
- `@avora/jobs`
- apps
- UI packages
- mobile packages
