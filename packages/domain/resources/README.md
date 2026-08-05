# resources

Owner: @avora/data

## Purpose

The `resources` module owns resource-domain boundaries and invariants.

Stage 7 Group 1 establishes the resource upload-intent contract surface used before ingestion implementation begins. It defines resource lifecycle states, storage path contracts, upload ticket contracts, and the vendor-free blob-store port.

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

## Boundaries

This module must not contain upload implementation, storage vendor implementation, API handlers, database schema, Supabase configuration, authentication implementation, AI implementation, retrieval implementation, jobs implementation, React components, React Native components, pages, screens, or tests in Stage 7 Group 1.

This module may declare vendor-free resource contracts and ports.

Supabase-specific storage implementation belongs outside this module.