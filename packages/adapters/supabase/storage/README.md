# storage

Owner: @avora/platform  
Security co-owner: @avora/security

## Purpose

The `storage` directory owns the Supabase Storage vendor adapter.

The domain resources module declares the vendor-free blob-store port. This adapter provides Supabase Storage behavior without importing `@avora/domain`, preserving the repository dependency matrix.

## Public surface

- `@avora/adapters/supabase/storage`

## Requirement trace

- ENG-018
- ENG-026
- ENG-176
- FR-035
- FR-036
- FR-037
- NFR-034
- NN-04
- NN-10
- SEC-230
- SEC-231

## Supported operations

- Create signed upload ticket.
- Create signed read URL.
- Promote object between buckets.
- Delete object.

## Boundaries

This directory delegates object storage to Supabase Storage.

This directory must not import `@avora/domain`.

This directory must not contain upload route handlers, web upload UI, mobile upload UI, resource repository methods, ingestion jobs, extraction, classification, AI behavior, retrieval behavior, React components, React Native components, pages, screens, or tests in Stage 7 Group 2.

Service-role credentials must not be used in browser or mobile runtimes.