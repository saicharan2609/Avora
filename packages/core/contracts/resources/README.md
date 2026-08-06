# resources contracts

Owner: @avora/platform  
Domain owner: @avora/data

## Purpose

The `resources` contracts directory owns shared API contracts for resource-related HTTP boundaries.

Stage 7 Group 5 introduces the contract-first resource upload API surface:

- declare upload request and response;
- complete upload request and response;
- resource DTOs;
- upload ticket DTOs;
- transport-level error DTOs.

These contracts are consumed by composition roots before route handlers delegate to policies, domain services, repositories, and ports.

## Public surface

- `@avora/core/contracts/resources`

## Requirement trace

- ENG-011
- ENG-016
- ENG-018
- ENG-150
- ENG-156
- ENG-176
- FR-032
- FR-035
- FR-036
- FR-037
- FR-039
- FR-042
- NFR-004
- NFR-031
- NFR-034
- NN-04
- NN-05
- NN-10

## Boundaries

Contracts in this directory must not import `@avora/domain`.

Contracts in this directory must not import `@avora/db`.

Contracts in this directory must not import `@avora/adapters`.

Contracts in this directory must not import `@avora/jobs`.

Contracts in this directory must not import `@avora/ai` or `@avora/retrieval`.

Contracts in this directory must not contain HTTP handlers, database execution, storage execution, domain service construction, worker handlers, React components, React Native components, pages, screens, tests, or runtime secrets.

Request bodies must not accept `studentId`. The authenticated composition root resolves identity and passes it inward.