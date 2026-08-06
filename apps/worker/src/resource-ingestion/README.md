# resource-ingestion

Owner: @avora/platform  
Domain owner: @avora/data

## Purpose

This directory owns worker-runtime wiring for resource ingestion jobs.

Stage 7 Group 9 connected the worker process to durable resource ingestion jobs by claiming queued jobs, heartbeating active claims, and delegating each claim to a handler interface.

Stage 7 Group 10 adds resource ingestion validation. Claimed jobs are validated against the resource row and storage object metadata. Valid resources transition to `processing`; invalid resources transition to `rejected`.

This group intentionally does not parse files, run OCR, call AI providers, generate embeddings, index retrieval content, or update resources to `ready`.

## Public surface

This directory is internal to `@avora/worker`.

## Boundaries

This directory may use service-role database composition because `apps/worker` is the worker plane.

This directory must not import `apps/web`, UI packages, React, React Native, Expo, `@avora/ai`, or `@avora/retrieval`.

Resource extraction belongs to a later stage.

## Stage 7 Group 11 validation harness

Stage 7 Group 11 adds a worker-level validation plan under:

- `__tests__/resource-ingestion-validation.worker-plan.json`

The plan records the expected worker claim, heartbeat, validation, completion, and failure behavior for the completed Stage 7 resource ingestion lifecycle.

The plan is intentionally documentation-first in this group. It does not add ingestion execution beyond the Stage 7 Group 10 validation behavior.