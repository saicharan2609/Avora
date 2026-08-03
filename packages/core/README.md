# @avora/core

Owner: @avora/architecture  
Package type: library  
Publishable: no

## Purpose

`@avora/core` is the canonical package for Avora type contracts that must be shared by web, mobile, worker, domain, data, AI, retrieval, jobs, adapters, and harness packages.

It owns type and validation seams for identifiers, contracts, domain shapes, event payloads, error contracts, query-key ownership, observability field safety, text types, time abstractions, and validation schemas.

## Public surface

- `@avora/core`
- `@avora/core/identity`
- `@avora/core/contracts`
- `@avora/core/domain-types`
- `@avora/core/events`
- `@avora/core/errors`
- `@avora/core/query-keys`
- `@avora/core/observability`
- `@avora/core/text`
- `@avora/core/time`
- `@avora/core/validation`

## Requirement trace

- REPO-001
- REPO-003
- REPO-004
- ENG-011
- ENG-013
- ENG-017
- ENG-022
- ENG-051
- ENG-053
- ENG-054
- ENG-058
- ENG-113
- ENG-156
- ENG-158
- ENG-198
- NN-09
- NN-10
- NN-11

## Boundaries

This package may depend on configuration and Zod only.

This package must not import any other internal Avora package.

This package must not import Node-only APIs, DOM APIs, React, React Native, database packages, AI packages, job packages, adapter packages, UI packages, application packages, or harness packages.

This package contains type contracts and validation schemas. Runtime behavior belongs in the package that owns the capability.