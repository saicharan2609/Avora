# resource chunking jobs

Owner: @avora/worker
Data owner: @avora/data
Domain owner: @avora/retrieval

## Purpose

This directory owns job contracts for resource chunking handoff.

Stage 11 adds the job-level envelope and queue port that allow resource extraction success to hand off into chunking execution, mirroring `@avora/jobs/resource-extraction`.

## Public surface

- `@avora/jobs/resource-chunking`

## Job name

- `resource.chunking.chunk`

## Boundaries

This directory must not import `@avora/db`.

This directory must not import `@avora/domain`.

This directory must not import `@avora/adapters`.

This directory must not import `@avora/ai`.

This directory must not import `@avora/retrieval`.

This directory must not import apps, UI packages, vendor SDKs, or worker runtime code.

This package defines portable job payloads and queue ports only.

It does not claim, execute, persist, chunk, embed, index, or route resources.

## Transactional enqueue note

As with `@avora/jobs/resource-extraction`, `ResourceChunkingQueuePort.enqueueResourceChunking` is not the path used after resource extraction succeeds in practice — that transition is a database-trigger transactional enqueue (`supabase/migrations/20260818100000_resource_chunking_jobs_transactional_enqueue.sql`). This contract remains the portable, vendor-free envelope shape for the `manual_rechunk_requested` reason.
