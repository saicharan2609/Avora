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
## Stage 10 Group 1 — Extraction contracts

Stage 10 Group 1 extends the vendor-free extraction contract surface for the derived text corpus.

New public contracts:

- `ExtractedResourceContent`
- `ExtractedPage`
- `ExtractionProvenance`

New provenance surface:

- `extractionProvenanceSources`
- `ExtractionProvenanceSource`

The contracts define extracted text pages, extraction provenance, extraction confidence, unsupported-page failure shape, and aggregate extracted resource content.

This group reuses the existing resource extraction identifiers, source locators, extracted content blocks, timestamps, resource identifiers, extraction strategy versions, and chunking strategy versions.

This group does not add database schema, repositories, services, adapters, worker execution, API routes, AI behavior, retrieval indexing, summaries, notes, flashcards, quizzes, UI, or mobile screens.
## Stage 9 Group 4 — Resource extraction service

Stage 9 Group 4 adds the domain application service for resource extraction.

New service:

- `ResourceExtractionService`

New factory:

- `createResourceExtractionService`

New error:

- `ResourceExtractionServiceError`

The service composes the vendor-free `ResourceExtractionPort` introduced in Stage 9 Group 1.

This group keeps extraction orchestration inside the domain layer while leaving persistence, worker execution, concrete parsing, OCR, AI, embeddings, and retrieval indexing to later groups.s

## Stage 9 Group 7 — Resource extraction completion traceability

Stage 9 Group 7 adds final completion traceability for the resource extraction pipeline.

The completion harness validates that the contracts and service added in the resources domain module are connected through the worker handler, job handoff, DB repository, persistence schema, and RLS plans.

No domain runtime behavior is changed in this group.
## Completion Group A — Resource placement contracts and policy

Completion Group A maps to authoritative Stage 9 Group 1: Placement contracts and policies.

New public contracts:

- `ResourcePlacement`
- `PlacementCandidate`
- `PlacementCorrection`

New policy surface:

- `PlacementPolicy`
- `createPlacementPolicy`
- `decidePlacementCandidate`
- `defaultPlacementPolicy`

The placement model supports the later pipeline:

```text
resource
→ classification candidate
→ placement policy
→ accepted or tentative placement
→ possible student correction