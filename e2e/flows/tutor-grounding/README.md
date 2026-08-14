# tutor-grounding flow

Owner: @avora/qa
AI owner: @avora/ai
Web owner: @avora/web

## Purpose

This directory owns the Stage 11 Group 9 tutor grounding and citation flow plan.

The flow proves that the tutor API boundary preserves the grounded answer contract:

- authenticated student;
- tutor request;
- scoped retrieval context;
- tutor gateway response;
- citations;
- HTTP response;
- insufficiency behavior;
- unresolved citation prevention.

## Public surface

This directory has no runtime package export.

## Current flow plans

- `tutor-grounding.flow-plan.json`

## Test data

- `../../fixtures/tutor-grounding.fixture.json`

Only synthetic fixtures may be used.

No production data, real student content, real academic material, provider credentials, service-role credentials, provider SDK calls, model calls, browser automation, mobile automation, or UI assertions may be introduced in this group.

## Boundaries

This flow is plan/fixture-based, matching the current e2e package convention for cross-cutting flows.

This directory must not implement runtime behavior, provider behavior, retrieval mechanics, database repositories, route handlers, UI, mobile screens, worker behavior, embeddings, vector search, summaries, notes, flashcards, quizzes, or Stage 12 functionality.
