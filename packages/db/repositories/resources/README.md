# resources repository

Owner: @avora/data

## Purpose

The `resources` repository owns concrete typed database access for `public.resources`.

It creates pending resource upload-intent rows, marks resource uploads completed, and reads resources by id for the owning student. It is structurally compatible with the resources-domain repository port while preserving the rule that `@avora/db` must not import `@avora/domain`.

## Public surface

- `@avora/db/repositories/resources`

## Requirement trace

- REPO-018
- REPO-019
- ENG-011
- ENG-012
- ENG-016
- ENG-018
- ENG-053
- ENG-150
- ENG-169
- ENG-172
- ENG-173
- ENG-175
- ENG-176
- FR-032
- FR-035
- FR-036
- FR-037
- FR-039
- FR-042
- NFR-004
- NFR-034
- NN-04
- SEC-081
- SEC-082
- SEC-230

## Operations

- `createPendingUpload`
- `markUploadCompleted`
- `getById`

## Boundaries

This directory must not import `@avora/domain`.

This directory must not call storage adapters.

This directory must not issue signed upload URLs or signed read URLs.

This directory must not contain route handlers, HTTP logic, authentication implementation, domain services, AI behavior, retrieval behavior, jobs behavior, React components, React Native components, pages, or screens.

All student-scoped operations include `student_id` predicates and execute through the supplied role-scoped database client.