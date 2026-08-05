# ports

Owner: @avora/data

## Purpose

The `ports` directory owns resource-domain ports.

Stage 7 Group 1 introduces the vendor-free `BlobStorePort` for issuing upload tickets, read URLs, object promotion, and object deletion.

## Public surface

- `@avora/domain/resources`

## Requirement trace

- ENG-018
- ENG-176
- FR-035
- FR-036
- FR-037
- NFR-034
- NN-04
- NN-10

## Boundaries

Ports in this directory must not import vendor SDKs.

Supabase Storage, S3-compatible storage, and any future storage provider belong in adapter packages, not in this module.

This directory must not contain storage implementation, API handlers, database implementation, authentication implementation, AI implementation, retrieval implementation, jobs implementation, React components, React Native components, pages, screens, or tests.