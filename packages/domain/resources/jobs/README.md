# jobs

Owner: @avora/data

## Purpose

The `jobs` directory owns resource-domain job contracts.

Stage 7 Group 7 introduces the resource ingestion job handoff contract. This contract describes the request created after a resource upload has been completed and before worker-side ingestion begins.

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
- NFR-034
- NN-04
- NN-05
- NN-10

## Boundaries

Job contracts in this directory must not import vendor SDKs.

Job contracts in this directory must not contain queue infrastructure, queue persistence, worker execution, OCR, malware scanning, file parsing, AI processing, embeddings, retrieval indexing, route handlers, database clients, storage SDK calls, React components, React Native components, pages, screens, or tests.

Resource ingestion execution belongs to a later worker-plane group.