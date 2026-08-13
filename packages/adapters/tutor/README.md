# tutor adapters

Owner: @avora/platform
AI co-owner: @avora/ai

## Purpose

This directory documents the approved adapter boundary for Stage 11 Group 7 tutor answer invocation.

The AI Gateway owns `TutorAnswerInvocationPort`. Concrete providers must remain behind adapters and satisfy that port structurally without leaking provider SDKs, provider keys, provider request shapes, model names, or routing policy into feature modules.

## Requirement trace

- Stage 11 Group 7 — Tutor orchestration adapter
- ENG-210
- ENG-211
- AD-12
- AD-13
- AIR-001
- AIR-002
- AIR-006

## Boundaries

This group does not add a concrete provider SDK adapter.

A future concrete provider adapter must:

- implement the AI-owned tutor answer invocation port structurally;
- accept a sealed grounded context envelope;
- return a candidate answer with citations;
- avoid provider names outside adapter-local implementation details;
- never bypass AI Gateway citation validation.

## Explicitly out of scope

Stage 11 Group 7 does not implement:

- web APIs;
- mobile APIs;
- UI;
- eval suites;
- e2e flows;
- database migrations;
- retrieval schema changes;
- provider-specific SDK calls.
