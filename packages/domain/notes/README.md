# notes

Owner: @avora/ai

## Purpose

The `notes` module owns notes-domain boundaries and invariants — the artifacts described together in `architecture.md` §20's "Notes Processing Pipeline": automatically generated per-resource **summaries** (`FR-070`) and, in a later group, on-demand, cross-resource-synthesised **Notes** (`FR-071`).

Stage 3 created only this module shell.

Stage 12 Group 7 adds the automatic resource summary boundary: the `ResourceSummary` contract, the `summary.generate.requested` job contract, the deterministic `ResourceSummaryGenerationService`, and the `ResourceSummaryRepositoryPort`/`ResourceSummaryQueuePort` port shapes. It does not implement `FR-071` structured Notes, which remain a distinct, later feature scoped to its own group.

## Public surface

- `@avora/domain/notes`

## Requirement trace

- REPO-007
- ENG-011
- ENG-015
- ENG-016
- ENG-018
- FR-070
- ENG-165
- ENG-166
- ENG-168
- NN-04
- NN-06
- NN-07
- NN-11

## Internal layers

- `contracts/`
- `services/`
- `repositories/`
- `events/`
- `jobs/`
- `policies/`
- `ports/`
- `__tests__/`

## Current contracts

- `ResourceSummary`, `ResourceSummaryBody`, `ResourceSummaryHeading`, `ResourceSummaryCitation`

## Current services

- `ResourceSummaryGenerationService` — pure, dependency-free: given a candidate summary body and citations already produced by the AI Gateway (`@avora/ai`'s `SummaryGateway`), validates structural completeness (at least one heading, no empty heading, at least one citation) and shapes the persistable `ResourceSummary`. It does not call a provider, a database, or a queue itself (`ENG-151`).

## Current jobs

- `ResourceSummaryJob` — `summary.generate.requested`, the domain-level job contract mirroring `packages/jobs/resource-summary/`'s portable envelope.

## Current ports

- `ResourceSummaryQueuePort` — `enqueueResourceSummary`.
- `ResourceSummaryRepositoryPort` (in `repositories/`) — `saveResourceSummary`, `getLatestResourceSummary`.

## Boundaries

This module must not contain AI implementation, provider SDK usage, API handlers, database schema, or Supabase configuration. Provider invocation lives behind `@avora/ai`'s `SummaryGateway`; concrete database access lives in `@avora/db/repositories/resource-summaries` and `@avora/db/repositories/resource-summary-jobs`, both structurally satisfying (not importing) this module's port types.

This module does not implement `FR-071` structured Notes (on-demand, cross-resource synthesis, student-editable, provenance transitions to `co_created` on first edit) — that is a distinct, later feature with its own trigger, scope, and lifecycle (`architecture.md` §20), not an extension of the automatic summary pipeline this group adds.
