-- Avora resource indexing jobs.
--
-- Purpose:
-- - Persist durable resource indexing job requests after resource chunking succeeds.
-- - Make indexing requests durable and claimable by the worker plane, mirroring the
--   resource_extraction_jobs / resource_chunking_jobs durable-queue pattern.
-- - Preserve student-scoped ownership and deny-by-default RLS.
--
-- This migration intentionally does not implement embedding persistence, vector
-- search, retrieval, AI Tutor orchestration, UI, or mobile behavior.

create table public.resource_indexing_jobs (
  job_id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (student_id) on delete cascade,
  resource_id uuid not null references public.resources (resource_id) on delete cascade,
  job_name text not null,
  reason text not null,
  priority text not null,
  status text not null default 'queued',
  attempt_count integer not null default 0,
  payload jsonb not null,
  locked_at timestamptz,
  locked_by text,
  heartbeat_at timestamptz,
  available_at timestamptz not null default now(),
  enqueued_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resource_indexing_jobs_job_name_check check (
    job_name = 'retrieval.index.resource'
  ),
  constraint resource_indexing_jobs_reason_check check (
    reason in (
      'resource_chunking_succeeded',
      'manual_reindex_requested',
      'embedding_strategy_backfill'
    )
  ),
  constraint resource_indexing_jobs_priority_check check (
    priority in ('interactive', 'normal', 'backfill')
  ),
  constraint resource_indexing_jobs_status_check check (
    status in (
      'queued',
      'claimed',
      'running',
      'succeeded',
      'failed',
      'dead_lettered',
      'cancelled'
    )
  ),
  constraint resource_indexing_jobs_attempt_count_non_negative_check check (
    attempt_count >= 0
  ),
  constraint resource_indexing_jobs_payload_object_check check (
    jsonb_typeof(payload) = 'object'
  ),
  constraint resource_indexing_jobs_payload_student_id_check check (
    payload ? 'studentId'
    and payload ->> 'studentId' = student_id::text
  ),
  constraint resource_indexing_jobs_payload_resource_id_check check (
    payload ? 'resourceId'
    and payload ->> 'resourceId' = resource_id::text
  ),
  constraint resource_indexing_jobs_payload_embedding_strategy_version_check check (
    payload ? 'embeddingStrategyVersion'
    and length(payload ->> 'embeddingStrategyVersion') > 0
  ),
  constraint resource_indexing_jobs_payload_requested_at_check check (
    payload ? 'requestedAt'
    and length(payload ->> 'requestedAt') > 0
  ),
  constraint resource_indexing_jobs_lock_state_check check (
    (
      status in ('queued', 'succeeded', 'failed', 'dead_lettered', 'cancelled')
      and locked_at is null
      and locked_by is null
      and heartbeat_at is null
    )
    or (
      status in ('claimed', 'running')
      and locked_at is not null
      and locked_by is not null
    )
  ),
  constraint resource_indexing_jobs_terminal_timestamp_check check (
    (
      status = 'succeeded'
      and completed_at is not null
      and failed_at is null
    )
    or (
      status in ('failed', 'dead_lettered')
      and failed_at is not null
      and completed_at is null
    )
    or (
      status not in ('succeeded', 'failed', 'dead_lettered')
      and completed_at is null
      and failed_at is null
    )
  )
);

comment on table public.resource_indexing_jobs is
  'classification: operational; purpose: durable resource indexing job requests created after resource chunking succeeds.';

comment on column public.resource_indexing_jobs.job_id is
  'classification: operational; purpose: stable job identifier for worker claim and status tracking.';

comment on column public.resource_indexing_jobs.student_id is
  'classification: identity; purpose: owning student identifier used for RLS and job ownership.';

comment on column public.resource_indexing_jobs.resource_id is
  'classification: academic_content; purpose: resource identifier whose ready retrieval chunks require embedding.';

comment on column public.resource_indexing_jobs.job_name is
  'classification: operational; purpose: typed job name used by the worker plane.';

comment on column public.resource_indexing_jobs.reason is
  'classification: operational; purpose: reason this indexing job was requested.';

comment on column public.resource_indexing_jobs.priority is
  'classification: operational; purpose: queue priority used for worker ordering.';

comment on column public.resource_indexing_jobs.status is
  'classification: operational; purpose: durable job lifecycle state.';

comment on column public.resource_indexing_jobs.attempt_count is
  'classification: operational; purpose: number of worker attempts made for this job.';

comment on column public.resource_indexing_jobs.payload is
  'classification: operational; purpose: typed resource indexing payload without raw chunk text or embedding vectors.';

comment on column public.resource_indexing_jobs.locked_at is
  'classification: operational; purpose: worker claim timestamp.';

comment on column public.resource_indexing_jobs.locked_by is
  'classification: operational; purpose: worker claim owner identifier.';

comment on column public.resource_indexing_jobs.heartbeat_at is
  'classification: operational; purpose: worker heartbeat timestamp.';

comment on column public.resource_indexing_jobs.available_at is
  'classification: operational; purpose: earliest timestamp when the job may be claimed.';

comment on column public.resource_indexing_jobs.enqueued_at is
  'classification: operational; purpose: timestamp when chunking success requested indexing.';

comment on column public.resource_indexing_jobs.started_at is
  'classification: operational; purpose: worker execution start timestamp.';

comment on column public.resource_indexing_jobs.completed_at is
  'classification: operational; purpose: worker success timestamp.';

comment on column public.resource_indexing_jobs.failed_at is
  'classification: operational; purpose: worker failure timestamp.';

comment on column public.resource_indexing_jobs.last_error is
  'classification: operational; purpose: sanitized worker error summary.';

comment on column public.resource_indexing_jobs.created_at is
  'classification: operational; purpose: job row audit timestamp.';

comment on column public.resource_indexing_jobs.updated_at is
  'classification: operational; purpose: job row audit timestamp.';

create index resource_indexing_jobs_student_id_idx
  on public.resource_indexing_jobs (student_id);

create index resource_indexing_jobs_resource_id_idx
  on public.resource_indexing_jobs (resource_id);

create index resource_indexing_jobs_status_priority_available_at_idx
  on public.resource_indexing_jobs (status, priority, available_at);

create index resource_indexing_jobs_student_resource_idx
  on public.resource_indexing_jobs (student_id, resource_id);

create index resource_indexing_jobs_enqueued_at_idx
  on public.resource_indexing_jobs (enqueued_at);

alter table public.resource_indexing_jobs enable row level security;
alter table public.resource_indexing_jobs force row level security;

create policy resource_indexing_jobs_select_own
  on public.resource_indexing_jobs
  for select
  to authenticated
  using (student_id = auth.uid());
