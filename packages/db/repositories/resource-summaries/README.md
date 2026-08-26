# resource summaries repository

Owner: @avora/data

## Purpose

This directory owns concrete database access for automatically generated, per-resource summaries (FR-070) and their machine-resolved citations.

Stage 12 Group 7 adds:

- persisting a generated summary and its citations together;
- reading the latest summary version for a resource.

## Public surface

- `@avora/db/repositories/resource-summaries`

## Requirement trace

- ENG-011
- ENG-016
- ENG-018
- ENG-165
- ENG-166
- ENG-168
- ENG-172
- ENG-174
- ENG-310
- FR-070
- NN-04
- NN-06
- NN-07
- NN-11
- SEC-007

## Boundaries

This repository must not import `@avora/domain`.

This repository must not import `@avora/jobs`.

This repository must not import `@avora/ai`, `@avora/retrieval`, UI packages, or apps.

This repository may use generated Supabase database types and role-scoped Supabase clients.

This repository persists a summary row (`resource_summaries`) together with its citation rows (`resource_summary_citations`) and reads the latest summary version for a resource. Summary generation, AI/provider calls, and job queueing belong outside this repository.

There is no authenticated insert, update, or delete policy on either table: both are system-written derived artifacts, student-readable and service-writable only (`ENG-174`).

## Versioning, not overwrite

A superseding `promptVersion` or `summaryStrategyVersion` produces a new `resource_summaries` row rather than overwriting a prior one (`NN-06`, `ENG-165`) — `resource_summaries_student_resource_version_uniq` in `supabase/migrations/20260826110000_resource_summaries.sql` enforces this at the database layer. `getLatestResourceSummary` selects the most recently created row for a resource; it does not resolve "latest" by comparing version strings.

## Citation locality

Every citation is a foreign key to `public.chunks` (`student_id`, `chunk_id`) and to `public.resources` (`student_id`, `resource_id`) — never a free-text locator (`NN-11`, `ENG-168`). `public.chunks` carries no `(student_id, resource_id, chunk_id)` composite unique constraint, so a citation's `chunk_id` actually belonging to the same `resource_id` as its parent summary is enforced at the AI Gateway citation-resolution layer (`packages/ai/gateway/summary/`), not by a database constraint — mirroring the precedent set by `chunk_embeddings` (`supabase/migrations/20260824091000_chunk_embeddings.sql`), which references `chunks` and `resources` through two independent composite foreign keys for the same reason.

## Non-atomic multi-table write

`saveResourceSummary` inserts the summary row and then its citation rows; there is no cross-table database transaction wrapping both (no precedent for one exists in this package). If citation persistence fails after the summary row was created, the summary row is deleted before the error is thrown, so a retried job (`ENG-193`) cleanly re-attempts the full save rather than colliding with the summary's uniqueness constraint or leaving an orphaned, citation-less summary row.

## Deletion cascade (`SEC-007`, `ENG-310`)

`resource_summaries` and `resource_summary_citations` join the deletion cascade via `on delete cascade` foreign keys to `public.students` and `public.resources` (and, for citations, to their parent `resource_summaries` row and to `public.chunks`) — the same mechanism every other resource-derived table in this repository relies on today; no orchestrated deletion service exists yet (that is Stage 12 Group 11's scope, see `packages/db/deletion-cascade/README.md`). Deleting a `resources` row or a `students` row removes every row in both tables through this FK chain, with no application code required. This is verified statically by `pnpm --filter @avora/db test:deletion-cascade` and was verified empirically against a live Postgres+pgvector instance during Group 7's implementation (see the Stage 12 Group 7 blocker-resolution report).
