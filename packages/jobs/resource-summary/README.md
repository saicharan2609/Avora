# resource summary jobs

Owner: @avora/worker
Data owner: @avora/data
Domain owner: @avora/ai

## Purpose

This directory owns job contracts for resource summary generation handoff.

Stage 12 Group 7 maps to `docs/MASTER-ROADMAP.md` "Group 7: Resource Summary Generation" (`FR-070`).

The job is created after resource indexing succeeds. It hands a resource ready for automatic summarisation to later summary generation execution without implementing AI generation, provider calls, workers, services, APIs, UI, or mobile behavior.

## Public surface

- `@avora/jobs/resource-summary`

## Job name

- `summary.generate.requested`

The underlying task/job class is `summary.generate`, matching `architecture.md` section 24.1's job taxonomy — not `resource.summary`, a stale roadmap wording corrected in `MASTER-ROADMAP.md` section 14.

## Public APIs

- `ResourceSummaryJobEnvelope`
- `createResourceSummaryJobEnvelope`
- `ResourceSummaryQueuePort`

## Boundaries

This directory must not import `@avora/db`.

This directory must not import `@avora/domain`.

This directory must not import `@avora/adapters`.

This directory must not import `@avora/ai`.

This directory must not import `@avora/retrieval`.

This directory must not import apps, UI packages, vendor SDKs, or worker runtime code.

This package defines portable job payloads and queue ports only.

It does not claim, execute, persist, generate summaries, call providers, embed, retrieve, classify, route resources, expose APIs, or update UI.
