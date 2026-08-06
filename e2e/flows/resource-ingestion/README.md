# resource-ingestion flow

Owner: @avora/qa  
Domain owner: @avora/data  
Worker owner: @avora/platform

## Purpose

This directory owns the Stage 7 resource ingestion validation flow plan.

Stage 7 Group 11 closes the resource ingestion foundation by defining the cross-cutting flow that proves:

- a student can create a resource upload intent;
- upload completion marks the resource as uploaded;
- upload completion persists a resource ingestion job;
- the worker claims the job;
- the worker validates the uploaded storage object metadata;
- a valid resource transitions to `processing`;
- the claimed job transitions to `succeeded`;
- invalid uploaded material transitions to `rejected`;
- failed validation transitions the claimed job to `failed`;
- cross-student access remains denied.

## Public surface

This directory has no runtime package export.

## Test data

Only synthetic fixtures may be used.

No production data, real student academic material, production credentials, or service-role credentials may be used by the e2e flow.

## Current flow plans

- `upload-to-validation.flow-plan.json`

## Boundaries

This directory must not import `@avora/db`.

This directory must not use service-role database access.

This directory must not use production data.

This directory must not implement ingestion runtime behavior, OCR, parsing, extraction, AI processing, embeddings, retrieval, UI components, mobile screens, or worker code.

This directory documents and later drives black-box flow validation only.