# deletion-cascade

Owner: @avora/data

## Purpose

This directory owns static, no-live-database structural verification that new student-data destinations join the deletion cascade at the schema layer (`SEC-007`, `ENG-310`), mirroring the declarative verification style already used by `packages/db/rls/harness/`.

## Scope: what this directory owns vs. Stage 12 Group 11

**This directory (Group 7) owns:** verifying that a specific table's migration SQL declares `on delete cascade` on every foreign key linking it back to `public.resources` and/or `public.students` — the same mechanism every existing resource-derived table in this repository already relies on (`chunks`, `chunk_embeddings`, `resource_extraction_documents`, `resource_placements`, `resource_classification_jobs`, `resource_indexing_jobs`, and so on). No orchestrated deletion service exists in this repository yet, so a foreign-key `on delete cascade` chain to `resources`/`students` is the entire deletion-cascade mechanism a new table can join today.

**Stage 12 Group 11 (`docs/MASTER-ROADMAP.md` "Group 11: Multi-Store Deletion Cascade") owns, and this directory does not implement:**

- the deletion domain service itself (`packages/domain/*/services/*Deletion*` — does not exist anywhere in the repository yet);
- step-up authentication for bulk/account deletion requests;
- coordinated deletion across Postgres, Supabase Storage blobs, and `pgvector` embeddings as a single orchestrated operation with an audit receipt;
- the "zero orphaned records" deletion verification harness against a live database;
- the data inventory document (`docs/PRIVACY.md`, referenced by `architecture.md` `AD-37`, does not exist in the repository yet).

This directory's script verifies schema-layer linkage only. It is not, and does not claim to be, Group 11's live deletion-verification harness.

## Verified tables

- `public.resource_summaries`
- `public.resource_summary_citations`
- `public.resource_summary_jobs`

## Verification method

`verify-resource-summary-deletion-cascade.mjs` reads the three tables' migration files from `supabase/migrations/` and asserts the exact `on delete cascade` foreign-key declarations are present in the SQL text. It performs no database connection and requires no Supabase CLI.

This static check was additionally verified once, empirically, against a real ephemeral Postgres + pgvector instance (all 32 repository migrations replayed in order, then a resource deleted and a student deleted, confirming all three tables' rows were removed by the database in both cases) — see the Stage 12 Group 7 blocker-resolution report for the full transcript. That live run is not part of this repository's committed test suite (no Supabase CLI or database is available in ordinary CI runs of this package), so this script is the durable, repeatable artifact that keeps the same guarantee enforced going forward.

## Run

```text
pnpm --filter @avora/db test:deletion-cascade
```

## Boundaries

This script does not connect to a database, does not implement RLS, does not implement the RLS harness's declarative plan format (deletion linkage is a fixed, small, enumerable list — not a per-table plan schema), and does not implement any part of Group 11's orchestrated deletion feature.
