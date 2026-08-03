# billing

Owner: @avora/platform

## Purpose

The `billing` module is the future home for billing-domain boundaries and invariants.

## Public surface

- `@avora/domain/billing`

## Requirement trace

- REPO-007
- ENG-011
- ENG-015
- ENG-016
- ENG-018

## Boundaries

Stage 3 creates only this module shell.

This module must not contain payment provider implementation, business logic, API handlers, database schema, Supabase configuration, vendor adapters, React components, React Native components, or tests.