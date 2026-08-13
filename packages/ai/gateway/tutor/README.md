# tutor

Owner: @avora/ai

## Purpose

This directory owns Stage 11 Group 6 AI Gateway tutor contracts.

It defines the typed contracts that later gateway orchestration must use for grounded tutor answers:

- tutor query;
- grounded context envelope;
- citation contract;
- grounded answer contract;
- answer validation;
- refusal and insufficiency behavior.

## Public surface

- `TutorQuery`
- `GroundedContextEnvelope`
- `GroundedAnswer`
- `Citation`
- `AIInsufficiencyResponse`
- `validateGroundedAnswer`

## Requirement trace

- Stage 11 Group 6 — AI Gateway tutor contracts
- AIR-001
- AIR-002
- AIR-003
- AIR-006
- AD-12
- AD-17
- AD-19
- ENG-221
- ENG-224
- ENG-229
- ENG-231

## Boundary rules

This directory defines contracts and deterministic validation only.

It does not call model providers, assemble prompts, invoke the Gateway, query retrieval, create route handlers, write database records, or emit UI state.

Provider SDKs remain forbidden here.

## Explicitly out of scope

Stage 11 Group 6 does not implement:

- provider invocation;
- prompt files;
- routing policy;
- tutor orchestration;
- retrieval search execution;
- vector search;
- web APIs;
- mobile APIs;
- eval suites;
- e2e flows.

Those belong to later groups.