# resource-summary

Owner: @avora/platform
Domain co-owner: @avora/ai

## Purpose

This worker-local module implements Stage 12 Group 7 automatic resource summary generation (`FR-070`).

It claims a durable `resource_summary_jobs` row, generates a summary via `SummaryGatewayPort.generateResourceSummary` (`@avora/ai`, grounded exclusively in the resource's own ready retrieval chunks), and persists the result through `ResourceSummariesRepository.saveResourceSummary` (`@avora/db/repositories/resource-summaries`).

An `insufficient_evidence` gateway response is an honest, non-retry terminal outcome (`EP-06`, `ENG-252`) — the job completes without persisting a summary. A `refused` gateway response (provider invocation failure, or a generated summary that failed citation validation) is surfaced as a thrown error, entering the existing bounded-retry / dead-letter path (`ENG-193`) rather than being silently dropped.

This module never mutates `resources`. A failed or refused summary attempt never affects access to the source resource.

## Public surface

- `createResourceSummaryWorkerHandler`
- `resourceSummaryWorkerHandlerName`
- `ResourceSummaryWorkerInput`
- `ResourceSummaryWorkerResult`
- `ResourceSummaryWorkerDependencies`
- `createResourceSummaryJobHandlerAdapter`
- `createResourceSummaryWorker`

## Requirement trace

- FR-070
- AD-12
- AD-14
- ENG-165
- ENG-166
- ENG-168
- ENG-171
- ENG-191
- ENG-192
- ENG-193
- ENG-252
- NN-04
- NN-06
- NN-07
- NN-11

## Data flow

```text
resource_summary_jobs (claimed row)
→ SummaryGatewayPort.generateResourceSummary (@avora/ai — student-scoped,
                                                grounded exclusively in this
                                                resource's own ready chunks)
→ mapGeneratedSummaryToSaveInput            (mapper.ts — bridges @avora/ai's
                                                DbRetrievalChunkId-keyed
                                                citations into
                                                @avora/db's ChunkId-keyed
                                                persistence input)
→ ResourceSummariesRepository.saveResourceSummary (resource_summaries +
                                                      resource_summary_citations)
```

## Composition

This module does not compose `SummaryGatewayPort` with a concrete Gemini client, a concrete `RetrievalChunkRepository`, or a concrete `ResourceSummariesRepository` — that composition-root wiring, along with claim-loop activation, is explicitly owned by Stage 12 Group 13 (`apps/worker/src/runtime/createWorkerRuntime.ts`), mirroring how Stage 12 Group 4's tutor answer adapter was itself left uncomposed into any route handler or worker job until its consuming group. `createResourceSummaryWorkerHandler`, `createResourceSummaryJobHandlerAdapter`, and `createResourceSummaryWorker` are complete and independently testable; they accept already-constructed dependencies.

## Boundaries

This module must not import a provider SDK directly (`NN-02`). Provider access happens only inside `@avora/ai/adapters/google`, reached through `SummaryGatewayPort`.

This module must not write to `resource_summaries` or `resource_summary_citations` directly; it only calls `ResourceSummariesRepository`.

This module does not implement the summary job's DB persistence (`packages/db/repositories/resource-summary-jobs`), the transactional enqueue trigger (`supabase/migrations/20260826113000_*.sql`), the AI Gateway summary pipeline itself (`packages/ai/gateway/summary/`), API routes, UI, mobile behavior, or worker runtime composition — those are owned elsewhere and reused unmodified or added as their own files.
