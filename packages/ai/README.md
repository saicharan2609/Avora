# @avora/ai

Owner: @avora/ai  
Protected paths: `prompts/`, `gateway/routing/`  
Package type: library  
Publishable: no

## Purpose

`@avora/ai` is the AI Gateway package for Avora.

It is the single enforcement point for budget gating, context assembly, sealed evidence envelopes, routing, invocation, output validation, citation resolution, provenance stamping, and AI telemetry.

Stage 4 Group 5 establishes only the directory structure, empty public seams, TypeScript wiring, and export wiring.

## Public surface

- `@avora/ai`
- `@avora/ai/gateway`
- `@avora/ai/gateway/budget-gate`
- `@avora/ai/gateway/context`
- `@avora/ai/gateway/envelope`
- `@avora/ai/gateway/invocation`
- `@avora/ai/gateway/validation`
- `@avora/ai/gateway/citations`
- `@avora/ai/gateway/telemetry`
- `@avora/ai/ports`
- `@avora/ai/adapters`
- `@avora/ai/adapters/antigravity`
- `@avora/ai/adapters/anthropic`
- `@avora/ai/adapters/openai`
- `@avora/ai/adapters/google`

## Requirement trace

- REPO-001
- REPO-003
- REPO-004
- REPO-012
- ENG-011
- ENG-013
- ENG-018
- ENG-019
- ENG-212
- ENG-216
- ENG-217
- ENG-221
- ENG-224
- ENG-229
- ENG-231
- ENG-322
- NN-02
- NN-03
- NN-08
- NN-09
- NN-11

## Workspace dependencies

- `@avora/core`
- `@avora/db`
- `@avora/retrieval`
- `@avora/config`

## Directory responsibilities

- `gateway/budget-gate/` is reserved for AI budget gating.
- `gateway/context/` is reserved for context assembly.
- `gateway/envelope/` is reserved for the sealed untrusted-evidence envelope.
- `gateway/routing/` is reserved for protected declarative routing policy.
- `gateway/invocation/` is reserved for invocation timeout, retry, and fallback mechanics.
- `gateway/validation/` is reserved for output contract validation.
- `gateway/citations/` is reserved for machine citation resolution.
- `gateway/telemetry/` is reserved for cost and quality signals.
- `ports/` owns vendor-free AI package ports.
- `adapters/` is the only AI package location where model, embedding, or orchestration provider names may appear in paths.
- `prompts/` is reserved for protected prompt assets.
- `scripts/` is reserved for package-owned AI scripts.
- `__tests__/` is reserved for colocated package tests.

## Boundaries

This package must not import `@avora/ui-web` or `@avora/ui-mobile`.

This package must not import feature modules.

Provider SDKs are permitted only under `adapters/`.

The `gateway/envelope/` path is the only AI package location that may construct model input.

Stage 4 Group 5 does not implement routing policy, prompts, provider SDKs, model calls, gateway behavior, budget logic, context assembly, envelopes, invocation, validation, citation resolution, telemetry, business logic, database schema, Supabase logic, APIs, authentication, UI code, or tests.
## Stage 11 Group 4 — Embedding adapter seam

Stage 11 Group 4 adds the provider-neutral embedding port used by resource indexing.

Public surface:

- `@avora/ai/embeddings`
- `EmbeddingPort`
- `EmbeddingVector`

The port accepts chunk text and returns embedding vectors. It does not embed through a concrete provider in this group.

Provider SDKs, provider keys, model names, routing policy, vector search, tutor orchestration, web APIs, mobile APIs, evals, and e2e flows are intentionally out of scope.
## Stage 11 Group 6 — AI Gateway tutor contracts

Stage 11 Group 6 establishes grounded tutor contracts inside the AI Gateway.

Public surface:

- `@avora/ai/gateway/tutor`
- `TutorQuery`
- `GroundedContextEnvelope`
- `Citation`
- `GroundedAnswer`
- `AIInsufficiencyResponse`
- `validateGroundedAnswer`

The contracts define the typed boundary for grounded tutor answers. The context envelope carries the exact chunk ids supplied to the model-facing path, and citation validation checks citations against that supplied chunk set.

This group does not implement provider invocation, prompt files, routing policy, tutor orchestration, retrieval execution, vector search, web APIs, mobile APIs, evals, or e2e flows.
## Stage 11 Group 7 — Tutor orchestration adapter

Stage 11 Group 7 adds the AI Gateway tutor orchestration adapter.

Public surface:

- `createTutorGateway`
- `TutorGatewayPort`
- `TutorAnswerInvocationPort`

The gateway flow is:

```text
TutorQuery
→ RetrievalSearchPort.search
→ createGroundedContextEnvelope
→ TutorAnswerInvocationPort.invokeTutorAnswer
→ validateGroundedAnswer
→ TutorGatewayResponse