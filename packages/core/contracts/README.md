# contracts

Owner: @avora/architecture

## Purpose

The `contracts` module is the future home for request and response type contracts consumed by clients and server entry points.

Stage 4 Group 1 creates only the shared contract seam. Feature-specific contracts are added later by the owning capability.

## Public surface

- `@avora/core/contracts`

## Requirement trace

- ENG-011
- ENG-156
- NN-10

## Boundaries

This module contains type contracts only.

It must not contain route handlers, transport code, database access, Supabase logic, authentication implementation, AI implementation, business logic, UI code, or tests.