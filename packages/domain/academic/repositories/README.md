# academic repositories

Owner: @avora/academic

## Purpose

This directory owns vendor-free repository ports for the academic domain.

Stage 8 Group 4 introduces the `AcademicSetupRepositoryPort` used by the adaptive academic setup service.

## Public surface

These ports are exported through:

- `@avora/domain/academic`

## Boundaries

This directory must not import `@avora/db`.

This directory must not import `@avora/adapters`.

This directory must not import apps, UI packages, worker packages, AI packages, or retrieval packages.

Concrete Supabase repositories live in `@avora/db`.