# resource-extraction flow

Owner: @avora/qa  
Worker owner: @avora/worker  
Domain owner: @avora/resources  
Data owner: @avora/data

## Purpose

This directory owns the Stage 9 resource extraction completion flow plan.

Stage 9 Group 7 closes the resource extraction foundation by defining the cross-cutting flow that proves:

- a validated uploaded resource can be represented as a resource extraction job;
- the resource extraction job envelope uses the expected job name;
- the worker handler consumes the job envelope;
- the worker handler maps the job payload to a domain extraction request;
- the domain extraction service invokes the extraction port;
- extracted or partially extracted output can be persisted through the extraction repository;
- extracted content blocks preserve source locator metadata;
- extracted content blocks preserve parent-child hierarchy;
- student-scoped RLS permits own reads and denies cross-student reads;
- authenticated students cannot insert, update, or delete extraction output.

## Public surface

This directory has no runtime package export.

## Current flow plans

- `resource-extraction.flow-plan.json`

## Test data

Only synthetic fixtures may be used.

No production data, real student content, real academic material, production credentials, service-role credentials, or real uploaded files may be committed into this directory.

## Boundaries

This directory must not import runtime packages.

This directory must not execute database writes directly.

This directory must not use service-role credentials.

This directory must not implement worker execution.

This directory must not implement storage download, OCR, parsing, AI model calls, embeddings, retrieval indexing, summaries, notes, flashcards, quizzes, API routes, UI, or mobile behavior.

This directory documents and later drives black-box flow validation only.