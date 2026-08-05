# contracts

Owner: @avora/data

## Purpose

The `contracts` directory owns vendor-free resource contract types.

Stage 7 Group 1 defines the resource upload-intent and storage-location contracts required before ingestion and storage adapters are implemented.

## Public surface

- `@avora/domain/resources`

## Requirement trace

- ENG-011
- ENG-016
- ENG-156
- ENG-176
- FR-032
- FR-035
- FR-036
- FR-037
- FR-042
- NFR-034
- NN-10

## Boundaries

Contracts in this directory must not import vendor SDKs.

Contracts in this directory must not contain business logic, API handlers, database implementation, storage implementation, authentication implementation, AI implementation, retrieval implementation, jobs implementation, React components, React Native components, pages, screens, or tests.