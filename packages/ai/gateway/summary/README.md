# summary

Owner: @avora/ai

## Purpose

This directory owns the Stage 12 Group 7 AI Gateway summary generation pipeline (`FR-070`), mirroring `gateway/tutor/` for the `summary.generate` task.

It defines the typed contracts and orchestration for automatic, per-resource summaries:

- summary query;
- grounded summary context envelope (evidence is every ready chunk of the source resource, not a retrieved/ranked subset);
- summary citation contract and validation;
- generated summary contract;
- summary gateway orchestration (`SummaryGateway`);
- refusal and insufficiency behavior.

## Public surface

- `SummaryQuery`
- `GroundedSummaryContextEnvelope`
- `GeneratedSummary`
- `SummaryBody`
- `SummaryHeading`
- `SummaryCitation`
- `SummaryInsufficiencyResponse`
- `SummaryRefusalResponse`
- `SummaryGatewayResponse`
- `validateGeneratedSummary`
- `createSummaryGateway`
- `SummaryGatewayPort`

## Gateway flow

```text
SummaryQuery
→ RetrievalChunkRepository.listRetrievalChunksByResource (status: "ready")
→ createGroundedSummaryContextEnvelope
→ SummaryInvocationPort.invokeSummaryGeneration
→ validateGeneratedSummary
→ SummaryGatewayResponse
```

Unlike `TutorGateway`, this gateway has no streaming path (`architecture.md` names no time-to-first-token requirement for automatic summaries — only the tutor path carries the `NFR-003` streaming SLO) and evidence is every ready chunk belonging to the source resource, not a scoped/ranked retrieval search result — a resource summary is grounded in the whole resource, not in a query-relevant subset of it.

## Task and naming

The task/job name is `summary.generate` (`summaryGenerationTask` in `gateway/invocation/SummaryInvocationPort.ts`), matching `architecture.md` section 24.1's job taxonomy exactly. `MASTER-ROADMAP.md`'s Stage 12 Group 7 entry originally read `resource.summary`; that wording conflicted with `architecture.md` (higher authority per `AGENTS.md` section 2) and has been corrected in `MASTER-ROADMAP.md` section 14.

`summaryQualityTiers` currently has exactly one member (`standard`), matching the single mid-tier model `architecture.md` section 20 specifies for automatic summaries — unlike `tutorAnswerQualityTiers`'s `standard`/`high` pair.

## Requirement trace

- FR-070
- AIR-001
- AIR-002
- AIR-003
- AIR-006
- AD-12
- AD-14
- AD-17
- AD-19
- ENG-165
- ENG-166
- ENG-168
- ENG-221
- ENG-224
- ENG-229
- ENG-230
- ENG-231
- ENG-252
- NN-02
- NN-03
- NN-06
- NN-07
- NN-11

## Boundary rules

Citation locality (a citation's chunk must belong to the same resource the summary was generated for) is enforced here, in `GroundedSummaryContextEnvelope`/`validateSummaryCitations`, by construction — the envelope's evidence set is built exclusively from the query's own `resourceId`, so a citation resolving against the envelope can never point at another resource's chunk. This is an application-layer guarantee, not a database constraint (see `packages/db/repositories/resource-summaries/README.md`).

Provider SDKs remain forbidden here; the concrete provider path lives in `adapters/google/GeminiSummaryAdapter.ts`.

## Explicitly out of scope

This directory does not implement:

- provider invocation (see `adapters/google/`);
- prompt files (see `prompts/summary/`);
- routing policy (see `gateway/routing/SummaryRoutingPolicy.ts`);
- worker orchestration (see `apps/worker/src/resource-summary/`);
- database persistence (see `packages/db/repositories/resource-summaries/`);
- web APIs, mobile APIs, or a rendered summary UI (Stage 12 Group 7 is explicitly scoped to a `packages/ui-web`/`packages/ui-mobile` domain-component **contract**, not a route or a rendered component).

Those belong to this same group's other files, or to a later group.
