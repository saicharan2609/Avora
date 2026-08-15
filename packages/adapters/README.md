# @avora/adapters

Owner: @avora/platform  
Package type: library  
Publishable: no

## Purpose

`@avora/adapters` owns concrete third-party provider adapters.

Stage 7 Group 2 established the Supabase Storage adapter for resource upload tickets.

Stage 7 Group 10 adds a Supabase Storage inspection adapter used by the worker plane to validate uploaded resource objects before extraction.

## Public surface

- `@avora/adapters/supabase/storage`
- `@avora/adapters/extraction`

## Boundaries

This package may import vendor SDKs.

This package may import `@avora/domain` for adapter contracts and domain-owned ports.

This package must not import `@avora/ai`.

This package must not import UI packages.

This package must not import apps.

Adapters are structurally typed against ports owned by higher layers.
## Stage 10 Group 3 — Extraction adapter port and provider seam

Stage 10 Group 3 adds the extraction adapter seam under:

- `extraction/`

The seam exposes provider-specific adapter factory names for document, scan, and handwriting extraction while adapting each provider shape to the domain-owned `ExtractionPort`.

This group does not add provider SDK calls, provider credentials, OCR, parsing, handwriting recognition, scan processing, storage access, persistence, RLS, worker execution, API routes, AI behavior, retrieval behavior, UI, or mobile code.
## Stage 11 Group 7 — Tutor provider adapter boundary
Stage 11 Group 7 reserves the adapter boundary for tutor answer invocation.
Concrete provider adapters must remain inside adapter-owned directories and satisfy the AI-owned `TutorAnswerInvocationPort` structurally.
This group does not add provider SDK calls, provider credentials, model names, web APIs, mobile APIs, evals, or e2e flows.