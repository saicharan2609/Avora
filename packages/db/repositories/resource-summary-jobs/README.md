# resource summary jobs repository

Owner: @avora/data

## Purpose

This directory owns concrete database access for durable resource summary generation job persistence.

Stage 12 Group 7 adds durable resource summary job persistence, claim, heartbeat, release, completion, and failure-recording operations, mirroring the existing `repositories/resource-classification-jobs` and `repositories/resource-indexing-jobs` pattern exactly.

## Public surface

- `@avora/db/repositories/resource-summary-jobs`

## Requirement trace

- ENG-011
- ENG-016
- ENG-018
- ENG-176
- ENG-168
- ENG-310
- FR-070
- NN-04
- NN-05
- NN-10
- SEC-007

## Boundaries

This repository must not import `@avora/domain`.

This repository must not import `@avora/jobs`.

This repository must not import `@avora/ai`, `@avora/retrieval`, UI packages, or apps.

This repository may use generated Supabase database types and role-scoped Supabase clients.

This repository persists queued resource summary jobs, reads them by ID, claims queued jobs, records heartbeats, releases claims, records completion, and records failures.

Summary generation execution, AI/provider calls, and summary persistence (`resource_summaries`, `resource_summary_citations`) belong outside this repository.

There is no authenticated insert policy on `resource_summary_jobs`: summary jobs are enqueued only by the worker plane, never by direct student action.

## Transactional enqueue

`enqueueResourceSummaryJob` is **not** the path used after resource indexing succeeds. That transition is created transactionally by a database trigger (`app_private.enqueue_resource_summary_job_on_indexing_success`, defined in `supabase/migrations/20260826113000_resource_summary_jobs_transactional_enqueue.sql`) firing on `resource_indexing_jobs` in the same transaction as the indexing job's terminal `succeeded` write, mirroring the classification trigger's use of the same mechanism (`ENG-154`/`AD-27`). The task/job name used throughout is `summary.generate`, matching `architecture.md` section 24.1's job taxonomy — not `resource.summary`, which was a stale roadmap wording corrected in `MASTER-ROADMAP.md` section 14.

Replay safety (`ENG-139`) is enforced by the database via `resource_summary_jobs_logical_identity_uniq`, a unique index on `(student_id, resource_id, payload->>'promptVersion', payload->>'summaryStrategyVersion')`. The trigger inserts with `ON CONFLICT ... DO NOTHING`.

`enqueueResourceSummaryJob` remains on this repository's public surface for callers outside the automatic pipeline (there is currently no such caller; the sole `reason` value, `resource_indexed`, is the automatic-pipeline reason).

### Why `resource_indexing_jobs.succeeded`, not `resources.lifecycle_state = 'ready'`

`architecture.md`'s narrative describes summary generation as beginning from a `resource.ready` domain event. That event has **no implementation anywhere in this codebase** — there is no outbox table, no event dispatcher, and no code that emits or subscribes to a literal `resource.ready` message (confirmed by an exhaustive repository-wide trace during Stage 12 Group 7's blocker resolution). The only concrete database analogue is `resources.lifecycle_state = 'ready'`, and that transition is written by `markResourceReady` (`packages/db/repositories/resources/repository.ts`), called exclusively from the **extraction** handler (`apps/worker/src/resource-extraction/handler.ts`) immediately after extraction succeeds — before chunking, indexing, or classification ever run, and therefore before any `chunks` rows exist for the resource at all. Subscribing to that transition would mean summary generation always observes zero chunks. This is a genuine, pre-existing divergence between `architecture.md`'s documented resource state machine (`processing → extracted → indexed → ready`) and the actual `resources_lifecycle_state_check` constraint (7 flatter states, with `'ready'` reached right after extraction) — reported here as an `ENG-411` finding, not silently resolved, and out of scope to fix in this group (it would require changing Stage 9's extraction handler).

Given no event exists to subscribe to, and the literal `lifecycle_state = 'ready'` value is unusable for this purpose, this trigger follows `architecture.md` section 24.1's job taxonomy table directly instead — the one authoritative, structured statement of summary's trigger point, independent of the unimplemented event narrative: `summary.generate | Post-index | Interactive | resource_id + prompt_version`. `resource_indexing_jobs.succeeded` is the concrete job-table transition that literal label names, and is exactly the same kind of resolution Stage 12 Group 6's classification trigger already made for its own "Post-extraction" label (`supabase/migrations/20260826101000_resource_classification_jobs_transactional_enqueue.sql`'s header comment): reading the taxonomy label as a data-availability requirement and picking the concrete job-table event that satisfies it, rather than inventing an event mechanism this repository does not have.

## Deletion cascade (`SEC-007`, `ENG-310`)

`resource_summary_jobs` joins the deletion cascade via `on delete cascade` foreign keys to `public.students` and `public.resources` — the same mechanism every other job table in this repository relies on today; no orchestrated deletion service exists yet (that is Stage 12 Group 11's scope, see `packages/db/deletion-cascade/README.md`). Deleting a `resources` row or a `students` row removes every matching row in this table through the FK chain, with no application code required. This is verified statically by `pnpm --filter @avora/db test:deletion-cascade` and was verified empirically against a live Postgres+pgvector instance during Group 7's implementation (see the Stage 12 Group 7 blocker-resolution report).
