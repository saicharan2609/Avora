# services

Owner: @avora/data

## Purpose

The `services` directory owns resource-domain application services.

Stage 7 Group 3 introduces `ResourceUploadService`, the vendor-free application-service seam for declaring upload intent and completing an upload after bytes have reached private storage.

## Public surface

- `@avora/domain/resources`

## Requirement trace

- ENG-011
- ENG-015
- ENG-016
- ENG-018
- ENG-176
- FR-032
- FR-035
- FR-036
- FR-037
- FR-039
- FR-042
- NFR-004
- NFR-006
- NFR-034
- NN-04
- NN-10

## Boundaries

Services in this directory coordinate vendor-free ports and repository ports.

Services in this directory must not import vendor SDKs.

Services in this directory must not import database clients.

Services in this directory must not contain API handlers, Supabase query builders, storage SDK calls, authentication implementation, AI implementation, retrieval implementation, jobs implementation, React components, React Native components, pages, screens, or tests.

## Stage 9 Group 4 — Resource extraction service

Stage 9 Group 4 adds the vendor-free `ResourceExtractionService`.

The service validates `ResourceExtractionRequest` inputs, invokes a provided `ResourceExtractionPort`, and checks that extracted or partially extracted documents match the requested student, resource, extraction strategy version, and chunking strategy version.

The service does not persist extraction output.

The service does not parse files, inspect storage, call OCR adapters, call AI adapters, create embeddings, index retrieval chunks, or expose web routes.