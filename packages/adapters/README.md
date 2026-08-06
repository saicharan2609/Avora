# @avora/adapters

Owner: @avora/platform  
Package type: library  
Publishable: no

## Purpose

`@avora/adapters` owns concrete third-party provider adapters.

Stage 7 Group 2 established the Supabase Storage adapter for resource upload tickets.

Stage 7 Group 10 adds a Supabase Storage inspection adapter used by the worker plane to validate uploaded resource objects before extraction.

## Public surface

- `@avora/adapters/supabase/storage`

## Boundaries

This package may import vendor SDKs.

This package must not import `@avora/domain`.

This package must not import `@avora/ai`.

This package must not import UI packages.

This package must not import apps.

Adapters are structurally typed against ports owned by higher layers.