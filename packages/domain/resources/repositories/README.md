# repositories

Owner: @avora/data

## Purpose

The `repositories` directory owns resource-domain repository ports.

Stage 7 Group 3 introduces `ResourceRepositoryPort`, the vendor-free persistence contract for resource upload-intent rows.

## Public surface

- `@avora/domain/resources`

## Requirement trace

- REPO-007
- ENG-011
- ENG-015
- ENG-016
- ENG-018
- ENG-176
- FR-035
- FR-036
- FR-037
- FR-039
- FR-042
- NFR-004
- NFR-034
- NN-04
- NN-10

## Boundaries

Repository ports in this directory must not import vendor SDKs.

Repository ports in this directory must not import database clients.

Repository ports in this directory must not contain SQL, Supabase query builders, storage implementation, upload route handlers, authentication implementation, AI implementation, retrieval implementation, jobs implementation, React components, React Native components, pages, screens, or tests.

Concrete database execution belongs outside this directory.