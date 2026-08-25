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
```

## Phase E — Tutor answer generation (Gemini provider)

Phase E adds the concrete provider path behind `TutorAnswerInvocationPort`: the versioned tutor
system policy, the six-part context assembly seam, the sealed model-input construction seam, the
protected routing policy, output-contract validation, machine citation resolution, and the Gemini
adapter itself.

Public surface:

- `@avora/ai/gateway/context` — `assembleTutorSixPartContext`, `TutorSixPartContext`
- `@avora/ai/gateway/envelope` — `sealTutorModelInput`, `SealedTutorModelInput`
- `@avora/ai/gateway/validation` — `validateTutorAnswerRawOutput`, `TutorAnswerRawOutput`
- `@avora/ai/gateway/citations` — `resolveTutorCitations`, `TutorCitationResolutionResult`
- `@avora/ai/adapters/google` — `createGeminiTutorAnswerAdapter`, `createGoogleGenAITutorAnswerClient`

The tutor answer generation flow is:

```text
TutorQuery + GroundedContextEnvelope (evidence, already sealed by Stage 11 Group 6/7)
→ assembleTutorSixPartContext        (gateway/context)   — system policy, task contract,
                                                             academic frame, personalisation,
                                                             evidence, interaction history
→ sealTutorModelInput                (gateway/envelope)  — the only seam that may construct
                                                             model input; redacts resourceId
                                                             and locator out of what is sent
→ resolveTutorAnswerRoutingConfig    (gateway/routing, protected, not part of the public
                                                             package surface)
→ GeminiTutorAnswerClient.generateContent (adapters/google) — provider SDK call, tools omitted
→ validateTutorAnswerRawOutput       (gateway/validation) — untrusted output, schema only
→ resolveTutorCitations              (gateway/citations)  — resourceId/locator resolved only
                                                             from the trusted envelope, never
                                                             from the model
→ TutorAnswerInvocationResult
```

`gateway/routing/` remains a protected, non-exported path (no `package.json` export, no barrel):
model identifiers are configuration data for the Gateway, never importable by a feature module.
`prompts/tutor/` is likewise internal to `@avora/ai` and is not part of the public package surface.

Requirement trace: AIR-001, AIR-002, AIR-003, AIR-006, ENG-210, ENG-211, ENG-212, ENG-216,
ENG-217, ENG-219, ENG-221, ENG-224, ENG-226, ENG-229, ENG-230, ENG-231, NN-02, NN-03, NN-11.

This phase does not implement AI budget gating (`gateway/budget-gate/`), telemetry
(`gateway/telemetry/`), or wiring the adapter into a route handler or worker job — those remain
open for a later stage.

## Pre-Stage-12 readiness correction — embedding invocation gate

`createGeminiEmbeddingPort` now requires an `invocationGateState` input and calls
`authorizeAiProviderInvocation` before ever calling the provider client, closing a gap identified
during the pre-Stage-12 readiness audit: unlike the tutor-answer path, the embedding adapter had no
authorization gate at all, even though it is the one path already wired with a real API key in
`apps/worker/src/runtime/createWorkerRuntime.ts`. The worker composition root passes
`invocationGateState: undefined`, which fails closed — this does not enable live embedding calls;
it only ensures the path refuses safely once a worker execution loop is eventually wired up.

## Stage 12 Group 2 — Content-addressed embedding cache

Stage 12 Group 2 adds the AD-30 / ENG-238 / SEC-322 content-addressed embedding cache as a
decorator over any `EmbeddingPort`, and requests Gemini's truncated 1536-dimension output instead
of the model's native 3072 dimensions so `public.chunk_embeddings` can use a standard pgvector
`vector` type with a standard HNSW index (pgvector's HNSW/IVFFlat indexes only support up to 2000
dimensions for that type). See `packages/ai/adapters/google/GeminiEmbeddingModel.ts`.

Public surface:

- `@avora/ai/embeddings` — `EmbeddingCachePort`, `createContentAddressedEmbeddingPort`,
  `ContentAddressedEmbeddingPortError`

The cache-aside flow is:

```text
EmbedTextsInput
→ EmbeddingCachePort.getCachedEmbeddings (keyed by contentHash + strategyVersion only)
→ cache misses → inner EmbeddingPort.embedTexts
→ EmbeddingCachePort.putCachedEmbeddings (write-through for misses)
→ EmbedTextsResult (ordered to match the originally requested inputs)
```

`EmbeddingCachePort` carries no `studentId`, `resourceId`, or `chunkId` at the type level, matching
the binding privacy constraint in `ENGINEERING-RULES.md` `ENG-238`: a cache entry is never
attributable to any student. The concrete cache repository (`@avora/db/repositories/embedding-cache`)
and the concrete chunk embedding persistence repository (`@avora/db/repositories/chunk-embeddings`)
are wired together only in `apps/worker/src/runtime/createWorkerRuntime.ts`.

This group does not implement vector search, scoped retrieval, hybrid search, AI Tutor
orchestration, web APIs, mobile APIs, evals, or e2e flows.

Requirement trace: AD-18, AD-19, AD-30, ENG-165, ENG-168, ENG-171, ENG-238, NN-04, NN-06, NN-07,
SEC-290, SEC-322.

## Pre-Stage-12 dependency approval — `@google/genai` (ENG-366 / ENG-404)

Owner decision (2026-08-23): Approved `@google/genai@2.18.0` as the Gemini provider SDK for the server/worker-side AI adapter implementation.
- Server/worker-side runtime only (never bundled into web or mobile client code).
- Maintained strictly behind `TutorAnswerInvocationPort` / `EmbeddingPort` in `packages/ai/adapters/google/`.
- No feature module touches the SDK directly (ENG-210, AD-12).
- License: Apache-2.0 (allowlisted per ENG-369).