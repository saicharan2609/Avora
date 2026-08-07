# academic services

Owner: @avora/academic

## Purpose

This directory owns vendor-free academic domain services.

Stage 8 Group 4 introduces the `AcademicSetupService`, which orchestrates initial academic setup through repository ports.

## Public surface

These services are exported through:

- `@avora/domain/academic`

## Boundaries

This directory must not import `@avora/db`.

This directory must not import vendor SDKs.

This directory must not import route handlers, UI packages, mobile packages, worker packages, AI packages, or retrieval packages.

API contracts and web route composition belong to later Stage 8 groups.