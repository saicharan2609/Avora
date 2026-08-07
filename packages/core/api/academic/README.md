# academic API contracts

Owner: @avora/platform  
Domain owner: @avora/academic

## Purpose

This directory owns JSON-safe API contracts for academic setup and academic graph reads.

Stage 8 Group 5 introduces request and response contracts for:

- creating academic terms;
- creating subjects;
- creating recursive structure units;
- reading academic setup progress;
- reading the academic structure tree.

## Public surface

- `@avora/core/api/academic`

## Boundaries

This directory must not import `@avora/domain`.

This directory must not import `@avora/db`.

This directory must not import `@avora/adapters`.

This directory must not import apps, UI packages, worker packages, AI packages, or retrieval packages.

Contracts here are transport-facing JSON shapes. Domain services and database repositories adapt to these contracts in later groups.