# supabase storage

Owner: @avora/platform  
Domain owner: @avora/data

## Purpose

This directory owns Supabase Storage adapter implementations.

Stage 7 Group 2 established upload-ticket storage behavior.

Stage 7 Group 10 adds storage object inspection for worker-side resource ingestion validation.

## Public surface

- `@avora/adapters/supabase/storage`

## Boundaries

This adapter may import `@supabase/supabase-js`.

This adapter must not import `@avora/domain`.

This adapter must not import apps, UI packages, AI packages, or retrieval packages.

Storage inspection only checks object existence and metadata. It does not parse, OCR, extract, index, or process resource content.