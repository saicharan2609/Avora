# resource placement adapter

Owner: @avora/platform

## Purpose

This directory contains the minimal DB-to-domain composition adapter for resource placement.

It wraps the DB-shaped `@avora/db/repositories/placement` repository and implements the domain-shaped `ResourcePlacementRepositoryPort`.

## Public surface

- `@avora/adapters/resource-placement`
- `createResourcePlacementRepositoryPortAdapter`

## Boundaries

This adapter may import:

- `@avora/db/repositories/placement`
- `@avora/domain/resources`
- `@avora/domain/academic`
- `@avora/core`

This adapter must not be imported by:

- `@avora/db`
- `@avora/domain`
- `@avora/core`
- `@avora/jobs`

The adapter does not implement placement policy, classification, persistence, RLS, API routes, UI, mobile code, AI behavior, retrieval behavior, or worker execution.