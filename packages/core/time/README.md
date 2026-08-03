# time

Owner: @avora/architecture

## Purpose

The `time` module owns shared time type contracts.

It creates the seam for injected time without implementing clocks or runtime behavior.

## Public surface

- `@avora/core/time`

## Requirement trace

- ENG-011
- ENG-065
- NN-10

## Boundaries

This module contains type contracts only.

It must not contain clock implementations, timers, scheduling behavior, business logic, database access, AI implementation, UI code, or tests.