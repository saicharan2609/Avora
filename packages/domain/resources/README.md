# resources

Owner: @avora/data

## Purpose

The `resources` module owns resource-domain boundaries and invariants.

Stage 7 Group 1 established the resource upload-intent contract surface used before ingestion implementation begins. It defines resource lifecycle states, storage path contracts, upload ticket contracts, and the vendor-free blob-store port.

Stage 7 Group 3 established the resource upload application-service seam.

Stage 7 Group 7 established the resource ingestion job handoff boundary.

Stage 7 Group 10 establishes the resource ingestion validation service. The service validates resource ownership, lifecycle state, storage location, content hash, byte size, MIME type, and storage object existence through vendor-free ports.

## Public surface

- `@avora/domain/resources`

## Requirement trace

- REPO-007
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
- NN-05
- NN-10

## Internal layers

- `contracts/`
- `services/`
- `repositories/`
- `events/`
- `jobs/`
- `policies/`
- `ports/`
- `__tests__/`

## Current contracts

- Resource kind
- Resource lifecycle state
- Resource storage location
- Resource record
- Upload intent
- Upload completion
- Upload ticket
- Resource ingestion job request
- Resource ingestion validation result

## Current ports

- `BlobStorePort`
- `ResourceObjectInspectionPort`
- `ResourceIngestionQueuePort`
- `ResourceRepositoryPort`

## Current services

- `ResourceUploadService`
- `ResourceIngestionValidationService`

## Boundaries

This module must not contain upload route handlers, storage vendor implementation, database client implementation, Supabase configuration, authentication implementation, AI implementation, retrieval implementation, jobs infrastructure, worker runtime, React components, React Native components, pages, screens, or tests in Stage 7 Group 10.

This module may declare vendor-free resource contracts, repository ports, storage ports, job contracts, queue ports, and application services.

Supabase-specific storage implementation belongs outside this module.

Supabase-specific database access belongs outside this module.

Resource extraction belongs to a later stage.

## Stage 9 Group 1 — Resource extraction contracts

Stage 9 Group 1 adds vendor-free resource extraction contracts.

New contract coverage:

- extraction document identifiers;
- extraction and chunking strategy versions;
- source locators;
- bounding boxes;
- text spans;
- time ranges;
- extracted content blocks;
- extraction documents;
- extraction request and result contracts;
- extraction failure contracts.

New port:

- `ResourceExtractionPort`

This group does not add database schema, repositories, storage adapters, OCR adapters, AI adapters, worker execution, embeddings, retrieval indexing, summaries, notes, flashcards, quizzes, API routes, UI, or mobile screens.

The contracts preserve locator metadata so later retrieval and citation verification can resolve content back to the original student resource.