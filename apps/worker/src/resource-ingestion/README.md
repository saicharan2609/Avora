# resource-ingestion

Owner: @avora/platform  
Domain owner: @avora/data

## Purpose

This directory owns worker-runtime wiring for resource ingestion jobs.

Stage 7 Group 9 connects the worker process to durable resource ingestion jobs by claiming queued jobs, heartbeating active claims, and delegating each claim to a handler interface.

This group intentionally does not validate uploaded resources, inspect storage objects, parse files, run OCR, call AI providers, generate embeddings, index retrieval content, or update resource lifecycle state.

## Public surface

This directory is internal to `@avora/worker`.

## Boundaries

This directory may use service-role database composition because `apps/worker` is the worker plane.

This directory must not import `apps/web`, UI packages, React, React Native, Expo, `@avora/ai`, or `@avora/retrieval`.

Resource ingestion execution belongs to Stage 7 Group 10.