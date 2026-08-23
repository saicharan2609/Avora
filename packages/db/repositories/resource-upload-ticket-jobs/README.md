# resource upload ticket jobs

Owner: @avora/data

## Purpose

Durable job persistence for resource upload-ticket requests: claim, complete, and failure-recording operations, mirroring the existing `repositories/resource-chunking-jobs` pattern.

This repository exists to remove a SEC-005 violation: signed upload URL issuance (a privileged Supabase Storage operation) is moved out of the web request runtime and into the worker plane. The web tier enqueues a job (student-scoped insert, no service-role credential); the worker claims it, performs the privileged operation with its own worker-tier service-role client, and writes the result back to the job row.

## Public surface

- `@avora/db/repositories/resource-upload-ticket-jobs`
- `createResourceUploadTicketJobsRepository`

## Boundaries

This repository does not perform the privileged Supabase Storage call itself — it only persists job state. The call happens in `apps/worker/src/resource-upload-ticket/`.

## RLS

- `packages/db/rls/__tests__/resource-upload-ticket-jobs.rls-plan.json`
- `supabase/policies/resource_upload_ticket_jobs.policy.sql`

Students may `select` and `insert` (their own `student_id` only). `update`/`delete` are denied for the `authenticated` role; worker mutation relies on service-role bypass.

## Idempotency

`resource_upload_ticket_jobs_active_resource_uniq` (`supabase/migrations/20260823090000_resource_upload_ticket_jobs_idempotency.sql`) enforces that at most one non-terminal (`queued`, `claimed`, `running`) ticket job may exist per resource at a time. `enqueueResourceUploadTicketJob` treats the resulting unique-violation as non-fatal: it re-reads and returns the existing active job instead of creating a duplicate, so a retried `POST /api/resources/uploads` request cannot create two independent in-flight ticket jobs for the same resource. A new job may still be enqueued once the previous one reaches a terminal state (`succeeded`, `failed`, `dead_lettered`, `cancelled`) — for example, after a signed URL expires.
