# resources repository

Owner: @avora/data

## Purpose

This directory owns concrete database access for student resources.

Stage 7 Group 4 established pending upload creation and upload completion persistence.

Stage 7 Group 10 adds resource ingestion validation persistence operations for reading resources for ingestion, marking valid resources as `processing`, and marking invalid resources as `rejected`.

## Public surface

- `@avora/db/repositories/resources`

## Boundaries

This repository must not import `@avora/domain`.

This repository must not import `@avora/ai`.

This repository must not import `@avora/retrieval`.

This repository must not import UI packages or apps.

This repository does not perform storage inspection, validation decisions, OCR, parsing, extraction, AI processing, embeddings, or retrieval indexing.