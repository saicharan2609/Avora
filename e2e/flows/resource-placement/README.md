# resource-placement flow

Owner: @avora/qa
Domain owner: @avora/resources
Data owner: @avora/data
Web owner: @avora/web

## Purpose

This directory owns the Stage 9 resource placement completion flow plan.

Stage 9 Group 6 closes the resource classification and placement foundation by defining the cross-cutting flow that proves:

- a student can create a resource upload intent;
- upload completion can hand off to validated ingestion;
- validated ingestion can produce a resource classification request;
- a persisted placement candidate can be read through the resource placement API;
- an existing placement candidate can be accepted by `candidateId`;
- placement correction can be recorded;
- placed resources can be listed by academic unit;
- another student cannot read or mutate the first student's placement state.

## Public surface

This directory has no runtime package export.

## Current flow plans

- `resource-placement.flow-plan.json`

## Test data

Only synthetic fixtures may be used.

No production data, real student content, real academic material, production credentials, service-role credentials, real uploaded files, model output, or provider output may be committed into this directory.

## Boundaries

This directory must not import runtime packages.

This directory must not execute database writes directly.

This directory must not use service-role credentials.

This directory must not implement classifier execution.

This directory must not implement worker execution.

This directory must not implement storage upload, storage download, OCR, parsing, AI model calls, embeddings, retrieval indexing, summaries, notes, flashcards, quizzes, API routes, UI, or mobile behavior.

This directory documents and later drives black-box flow validation only.

The placement candidate in the fixture represents expected persisted state produced by trusted classification infrastructure. The harness must not fabricate a placement candidate in application code.