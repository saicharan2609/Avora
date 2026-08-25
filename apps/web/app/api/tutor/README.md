# tutor API

Owner: @avora/web
Domain owner: @avora/ai

## Purpose

This directory owns the Stage 12 Group 5 web tutor API boundary.

The route accepts an authenticated student question scoped to a subject, structure unit, resource, or broader academic scope, invokes the AI Tutor Gateway with hybrid retrieval and concrete Gemini provider adapters, and streams the response to the client using Server-Sent Events (SSE).

## Public routes

- `POST /api/tutor/ask`
- `POST /api/tutor`

## Data flow

```text
client request (Accept: text/event-stream or application/json)
→ @avora/core/contracts/tutor validation
→ authenticated student resolution (session cookie -> student row)
→ web-local tutor composition (HybridRetrievalSearch + GeminiTutorAnswerAdapter)
→ TutorGatewayPort.streamTutorQuery (or answerTutorQuery for non-streaming)
→ real-time @google/genai generateContentStream()
→ progressive Server-Sent Events (live tokens -> server-side citation validation -> final verified answer / insufficiency / refusal)
```

## Stage 12 Group 5 — Real Provider Streaming & Hybrid Composition

Stage 12 Group 5 implements:

1. End-to-end real model token streaming via `@google/genai` `generateContentStream()`, extracting progressive answer tokens and delivering them over Server-Sent Events (SSE) respecting the time-to-first-token (< 1.5s) latency SLO (`AD-03`, `NFR-003`, `ENG-294`).
2. Authoritative server-side citation verification executed on the complete accumulated response against the sealed context envelope before the final `answered` event is emitted.
3. Web composition root (`_shared/composition.ts`) wiring `createTutorHybridRetrievalSearch` with query embeddings and `createGeminiTutorAnswerAdapter`.
4. Client-side stream consumer in `@avora/ui-web` (`consumeTutorReadableStream`) managing progressive token accumulation, terminal answer/refusal states, and connection lifecycle.
5. Fail-closed citation validation and security boundaries preventing provider credentials or unvalidated model locators from escaping to client runtimes (`SEC-250`, `SEC-300`, `SEC-301`, `AIR-006`, `NN-02`, `NN-03`).

Requirement trace: AD-03, NFR-003, ENG-294, SEC-300, AIR-006, SEC-301, SEC-290, SEC-291, SEC-250, NN-02, NN-03.
