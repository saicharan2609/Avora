# @avora/jobs

Owner: @avora/platform  
Package type: library  
Publishable: no

## Purpose

`@avora/jobs` owns Avora's job machinery package boundary.

It is the future home for queue ports, queue primitives, job state-machine machinery, claim/checkpoint/heartbeat primitives, priority classes, and dead-letter handling.

Stage 4 Group 5 establishes only the directory structure, empty public seams, TypeScript wiring, and export wiring.

## Public surface

- `@avora/jobs`
- `@avora/jobs/ports`
- `@avora/jobs/queue`
- `@avora/jobs/state-machines`
- `@avora/jobs/claim`
- `@avora/jobs/checkpoint`
- `@avora/jobs/heartbeat`
- `@avora/jobs/priorities`
- `@avora/jobs/dead-letter`

## Requirement trace

- REPO-001
- REPO-003
- REPO-004
- REPO-012
- ENG-011
- ENG-013
- ENG-018
- ENG-019
- ENG-154
- NN-05

## Workspace dependencies

- `@avora/core`
- `@avora/db`
- `@avora/config`

## Directory responsibilities

- `ports/` owns package-level job ports.
- `queue/` is reserved for queue primitives.
- `state-machines/` is reserved for job state-machine machinery.
- `claim/` is reserved for claim primitives.
- `checkpoint/` is reserved for checkpoint primitives.
- `heartbeat/` is reserved for heartbeat primitives.
- `priorities/` is reserved for priority-class machinery.
- `dead-letter/` is reserved for dead-letter handling.
- `__tests__/` is reserved for colocated package tests.

## Boundaries

This package must not import `@avora/domain`.

This package must not import `@avora/ai`.

This package must not import `@avora/ui-web` or `@avora/ui-mobile`.

Job definitions live in the owning domain module. Only cross-cutting job machinery lives in this package.

Stage 4 Group 5 does not implement queues, state machines, claim logic, checkpoint logic, heartbeat logic, priority logic, dead-letter handling, business logic, database schema, Supabase logic, APIs, authentication, AI implementation, UI code, or tests.