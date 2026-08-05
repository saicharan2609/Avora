# ports

Owner: @avora/data

## Purpose

The `ports` directory owns package-level database ports consumed across modules.

Stage 6 Group 4 introduces the `DatabaseClientFactoryPort` and `RepositoryExecutionContext` seams so future repositories can execute through explicit role-scoped clients.

## Public surface

- `@avora/db/ports`

## Requirement trace

- REPO-018
- ENG-011
- ENG-018
- ENG-053
- ENG-165
- NN-04
- NN-10

## Boundaries

This directory must not import `@avora/domain`.

This directory must not contain repository implementation, feature business logic, API handlers, authentication implementation, AI implementation, retrieval implementation, jobs implementation, UI code, or tests in Stage 6 Group 4.