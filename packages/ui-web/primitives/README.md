# primitives

Owner: @avora/design-system

## Purpose

The `primitives` directory owns web primitive contracts for Avora.

Primitives are the web layer where accessibility obligations are satisfied before domain components and surfaces consume them.

## Public surface

- `@avora/ui-web/primitives`

## Requirement trace

- ENG-011
- ENG-124
- ENG-297
- ENG-298
- Rule T-01
- Rule T-02
- Rule CP-02
- Rule HO-02

## Boundaries

This directory must not contain business logic, domain logic, APIs, database implementation, Supabase implementation, authentication implementation, AI implementation, retrieval implementation, jobs implementation, pages, screens, or tests.

Stage 5 Group 2 defines contracts only. It does not implement React components.