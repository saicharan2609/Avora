# @avora/evals

Owner: @avora/ai  
Package type: test harness  
Publishable: no

## Purpose

`@avora/evals` is the AI evaluation harness package for Avora.

It owns the top-level evaluation directories used for grounding, citation, extraction, and assessment-validity gates.

Stage 4 Group 6 wires the first fail-closed citation-validity gate. It does not implement model calls, prompt execution, provider SDK usage, routing policy, retrieval implementation, AI behaviour, API handlers, database schema, Supabase logic, authentication, React components, React Native components, pages, or screens.

## Public surface

- `@avora/evals`
- `@avora/evals/suites`

## Requirement trace

- REPO-001
- REPO-003
- REPO-004
- ENG-011
- ENG-019
- ENG-218
- ENG-229
- NN-02
- NN-03
- NN-11
- NN-12

## Workspace dependencies

- `@avora/config`

## Harness directories

- `corpora/`
- `suites/`

## Gates

- `eval:ai` runs the AI evaluation gate harness.
- Citation validity is fail-closed.
- A cited chunk must exist in the supplied evidence set.
- A cited chunk must resolve to stored synthetic content with a locator.
- Evaluation fixtures in this stage are synthetic only.

## Boundaries

This package must not contain AI implementation, prompt implementation, provider SDK usage, model names, application features, business logic, API handlers, database schema, Supabase configuration, authentication implementation, React components, React Native components, pages, or screens.

Consented corpora and full AI evaluation suites remain later-stage work.

## Stage 10 Group 5 — Extraction quality eval suite

Stage 10 Group 5 adds a deterministic resource extraction quality gate.

The suite covers:

- normal extracted documents with sufficient synthetic coverage;
- partially extracted documents with usable content and honest warnings or page failures;
- scan and handwriting-style extraction success;
- unsupported-page honesty through existing warning and page-failure semantics;
- low-coverage extraction failure;
- fail-closed behavior when the suite has no cases.

The extraction quality suite evaluates synthetic extraction-result-shaped fixtures only. It does not call AI providers, OCR, storage, Supabase, databases, worker code, web APIs, mobile APIs, external services, or runtime extraction providers.

Run:

```text
pnpm --filter @avora/evals eval:extraction
```

## Stage 12 Group 7 — Summary grounding eval suite

Stage 12 Group 7 adds a deterministic summary grounding gate for `summary.generate` (`FR-070`), mirroring `tutor-grounding.gate.ts`'s structure: a `SummaryGateway` is constructed with a deterministic (fake) `SummaryInvocationPort` returning a fixed synthetic candidate per case, and the gate asserts the resulting `SummaryGatewayResponse`.

The suite covers:

- groundedness — every summary point is lexically supported by the supplied resource evidence;
- unsupported-claim rejection — a summary point not present in the supplied evidence fails groundedness;
- coverage — a summary citing only one of several supplied chunks fails; citing more than one passes;
- coherence/structure — a summary with an empty heading title fails `validateGeneratedSummary`'s structural check;
- citation validity — citations resolve only to chunk ids present in the grounded summary context envelope;
- citation locality — a citation to a chunk belonging to a different resource is structurally indistinguishable from an unknown chunk id, because the envelope is built exclusively from the query's own resource's chunks;
- fail-closed behavior — a resource with zero ready chunks returns `insufficient_evidence` without invoking the provider, and an empty case list fails the gate closed.

The summary grounding suite evaluates synthetic, `@avora/ai`-shaped fixtures only. It does not call AI providers, storage, Supabase, databases, worker code, web APIs, mobile APIs, or external services.

Run:

```text
pnpm --filter @avora/evals eval:summary