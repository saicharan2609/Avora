# events

Owner: @avora/architecture

## Purpose

The `events` module is the future home for shared domain event payload types and event naming contracts.

Stage 4 Group 1 creates only the shared event seam. Event producers, consumers, outbox writes, and job dispatch live in their owning packages.

## Public surface

- `@avora/core/events`

## Requirement trace

- ENG-011
- ENG-198
- ENG-199
- NN-09
- NN-10

## Boundaries

This module contains type contracts only.

It must not contain event dispatch, outbox logic, analytics logic, database access, business logic, AI implementation, UI code, or tests.