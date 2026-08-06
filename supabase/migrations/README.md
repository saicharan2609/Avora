# migrations

Owner: @avora/data

## Purpose

This directory contains versioned Supabase SQL migrations.

## Current Stage 7 artifacts

- student identity persistence
- resources
- resource ingestion jobs

## Boundaries

Migrations must not contain application code.

Migrations must not implement worker execution, AI processing, retrieval, OCR, parsing, UI, or mobile behavior.

Stage 7 Group 8 adds `public.resource_ingestion_jobs` only.