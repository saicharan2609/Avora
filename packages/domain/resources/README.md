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
- FR-038
- FR-039
- FR-042
- AD-22
- ENG-029
- NFR-004
- NFR-006
- NFR-034
- NN-01
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
## Stage 10 Group 3 — Extraction adapter port and provider seam

Stage 10 Group 3 exposes the exact extraction port name used by adapter-facing code.

New public API:

- `ExtractionPort`

`ExtractionPort` is an alias of the existing vendor-free `ResourceExtractionPort`.

This group does not duplicate extraction contracts, extraction services, extraction repositories, database schema, worker execution, OCR adapters, parser adapters, AI behavior, retrieval indexing, API routes, UI, or mobile screens.
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
```

## Stage 12 Group 6 — Resource auto-classification

Stage 12 Group 6 adds the deterministic classification service that generates the
`PlacementCandidate` consumed by Completion Group A's existing `PlacementPolicy` and
`ResourcePlacementService`.

New public contracts:

- `ClassifyResourceInput`
- `ClassificationContentSignal`
- `ClassificationCorrectionSignal`

New service:

- `ResourceClassificationService`
- `createResourceClassificationService`

The service matches trusted extracted content signals (headings) and resource
metadata (filename) against the student's own academic structure tree, using
token-overlap scoring only. It never assumes a hierarchy level or a fixed
label (`NN-01`, `ENG-029`): structure units are matched purely on their
student-authored `title`, never on `unitKind`. A resource's own prior
same-student placement corrections contribute a small, capped, deterministic
boost (`AD-22`) — never the sole evidence for a candidate. Zero matching
evidence produces zero candidates; this service never fabricates a
placement (Group 6 explicit non-goal).

This addition also extends `ResourcePlacementRepositoryPort` /
`ResourcePlacementService` with `savePlacementCandidate` (persist a
server-generated candidate independently of a placement decision, matching
the existing `resource_placement_candidates` migration's documented
"persist before acceptance" design) and `listPlacementCorrectionsByStudent`
(read a student's own correction history across resources, needed for the
`AD-22` prior). Both extend existing DB-repository capability
(`upsertPlacementCandidate` already existed unused by the domain port) or
mirror an existing per-resource method with the resource filter removed.

This group does not implement AI/provider calls, embeddings-based similarity,
worker execution, database schema, API routes, or UI. Those live in
`apps/worker/src/resource-classification/`, the new
`resource_classification_jobs` persistence, and the existing (unmodified)
placement API routes respectively.