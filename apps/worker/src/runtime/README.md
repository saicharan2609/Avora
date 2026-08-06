# runtime

Owner: @avora/platform

## Purpose

This directory owns worker process runtime composition.

Stage 7 Group 9 composes the resource ingestion claim worker using service-role database access.

## Public surface

This directory is internal to `@avora/worker`.

## Boundaries

The worker runtime may use service-role credentials.

The worker runtime must not accept client input.

The worker runtime must not import web, mobile, UI, AI, retrieval, OCR, parser, or storage execution code in Stage 7 Group 9.