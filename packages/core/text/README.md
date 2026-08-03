# text

Owner: @avora/architecture

## Purpose

The `text` module owns named text type contracts that are generic enough for `@avora/core` but still have a clear owner.

It exists as a named module rather than a generic catch-all folder.

## Public surface

- `@avora/core/text`

## Requirement trace

- ENG-011
- ENG-017
- NN-10

## Boundaries

This module contains type contracts only.

It must not contain formatting behavior, copywriting, UI strings, business logic, database access, AI implementation, or tests.