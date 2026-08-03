# observability

Owner: @avora/architecture

## Purpose

The `observability` module owns type contracts for log-safe fields.

Its purpose is to make unsafe logging harder to express by separating operational metadata from student academic content.

## Public surface

- `@avora/core/observability`

## Requirement trace

- ENG-011
- ENG-256
- NN-09
- NN-10

## Boundaries

This module contains type contracts only.

It must not contain logger implementations, transport sinks, analytics destinations, database access, AI implementation, business logic, UI code, or tests.