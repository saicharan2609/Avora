# validation

Owner: @avora/architecture

## Purpose

The `validation` module owns shared validation schema type contracts for Avora.

It provides the repository-wide seam for strict boundary validation without introducing feature-specific schemas in this group.

## Public surface

- `@avora/core/validation`

## Requirement trace

- ENG-011
- ENG-051
- ENG-156
- NN-10

## Boundaries

This module may import Zod types.

It must not contain feature-specific schemas, route handlers, transport code, database access, Supabase logic, authentication implementation, AI implementation, UI code, business logic, or tests.