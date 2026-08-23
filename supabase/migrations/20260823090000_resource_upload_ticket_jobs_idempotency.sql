-- Avora resource upload ticket jobs — idempotency correction.
--
-- Purpose:
-- - Close a data-integrity gap identified during the pre-Stage-12 readiness
--   audit (ENG-139, ENG-157): unlike its sibling tables
--   (resource_chunking_jobs, resource_indexing_jobs), resource_upload_ticket_jobs
--   had no database-enforced protection against duplicate job rows for the
--   same resource. Because this table is enqueued directly from the web
--   request path (POST /api/resources/uploads), not from a database trigger,
--   a retried or duplicated request could otherwise create two independent,
--   concurrently-active ticket jobs for the same resource.
-- - A resource legitimately needs a *new* ticket job after a previous one
--   reaches a terminal state (a signed upload URL can expire, or a prior
--   attempt can fail) — so, unlike the chunking/indexing tables' permanent
--   logical-identity unique index, this constraint is scoped to the
--   non-terminal states only ('queued', 'claimed', 'running'). At most one
--   such in-flight job may exist per resource at any time.
--
-- This migration intentionally does not implement Stripe/PSP, billing,
-- Gemini/AI provider logic, or any Stage 12 functionality. It narrowly closes
-- the idempotency gap for this one worker flow.

create unique index resource_upload_ticket_jobs_active_resource_uniq
  on public.resource_upload_ticket_jobs (resource_id)
  where status in ('queued', 'claimed', 'running');

comment on index resource_upload_ticket_jobs_active_resource_uniq is
  'classification: operational; purpose: ENG-139-style database-enforced idempotency preventing more than one concurrently in-flight (queued, claimed, or running) upload-ticket job from existing for the same resource at a time.';
