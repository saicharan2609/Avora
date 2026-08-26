-- Avora resource summary jobs.
--
-- Purpose:
-- - Persist durable resource summary generation job requests, mirroring the
--   resource_extraction_jobs / resource_chunking_jobs / resource_indexing_jobs
--   / resource_classification_jobs durable-queue pattern exactly.
-- - Make the worker-side summary generation job handler claimable,
--   retryable, and idempotent (ENG-191, ENG-192, ENG-193), matching the
--   sibling job tables' claim/heartbeat/complete/fail lifecycle.
-- - Preserve student-scoped ownership and deny-by-default RLS (NN-04).
--
-- The job/task name used throughout this migration and its consumers is
-- `summary.generate`, matching architecture.md section 24.1's job taxonomy
-- exactly ("summary.generate | Post-index | Interactive |
-- resource_id + prompt_version"). MASTER-ROADMAP.md's Stage 12 Group 7
-- entry originally read `resource.summary`; that wording conflicted with
-- architecture.md and has been corrected in MASTER-ROADMAP.md section 14
-- (architecture.md is higher authority than the roadmap per AGENTS.md
-- section 2 / CLAUDE.md's document authority table).
--
-- This migration intentionally does not implement summary generation
-- execution, AI/provider behavior, workers, API routes, UI, or mobile
-- behavior. Stage 12 Group 7 maps to docs/MASTER-ROADMAP.md
-- "Group 7: Resource Summary Generation" (FR-070).

create table public.resource_summary_jobs (
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
  constraint resource_summary_jobs_job_name_check check (
    job_name = 'summary.generate.requested'
  ),
  constraint resource_summary_jobs_reason_check check (
    reason in (
      'resource_indexed'
    )
  ),
  constraint resource_summary_jobs_priority_check check (
    priority in ('interactive', 'normal', 'backfill')
  ),
  constraint resource_summary_jobs_status_check check (
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
  constraint resource_summary_jobs_attempt_count_non_negative_check check (
    attempt_count >= 0
  ),
  constraint resource_summary_jobs_payload_object_check check (
    jsonb_typeof(payload) = 'object'
  ),
  constraint resource_summary_jobs_payload_student_id_check check (
    payload ? 'studentId'
    and payload ->> 'studentId' = student_id::text
  ),
  constraint resource_summary_jobs_payload_resource_id_check check (
    payload ? 'resourceId'
    and payload ->> 'resourceId' = resource_id::text
  ),
  constraint resource_summary_jobs_payload_prompt_version_check check (
    payload ? 'promptVersion'
    and length(payload ->> 'promptVersion') > 0
  ),
  constraint resource_summary_jobs_payload_summary_strategy_version_check check (
    payload ? 'summaryStrategyVersion'
    and length(payload ->> 'summaryStrategyVersion') > 0
  ),
  constraint resource_summary_jobs_payload_requested_at_check check (
    payload ? 'requestedAt'
    and length(payload ->> 'requestedAt') > 0
  ),
  constraint resource_summary_jobs_lock_state_check check (
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
  constraint resource_summary_jobs_terminal_timestamp_check check (
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

comment on table public.resource_summary_jobs is
  'notes: operational; purpose: durable resource summary generation job requests created after resource indexing succeeds.';

comment on column public.resource_summary_jobs.job_id is
  'notes: operational; purpose: stable job identifier for worker claim and status tracking.';

comment on column public.resource_summary_jobs.student_id is
  'notes: identity; purpose: owning student identifier used for RLS and job ownership.';

comment on column public.resource_summary_jobs.resource_id is
  'notes: academic_content; purpose: resource identifier the summary is generated for.';

comment on column public.resource_summary_jobs.job_name is
  'notes: operational; purpose: typed job name used by the worker plane.';

comment on column public.resource_summary_jobs.reason is
  'notes: operational; purpose: reason this summary job was requested.';

comment on column public.resource_summary_jobs.priority is
  'notes: operational; purpose: queue priority used for worker ordering.';

comment on column public.resource_summary_jobs.status is
  'notes: operational; purpose: durable job lifecycle state.';

comment on column public.resource_summary_jobs.attempt_count is
  'notes: operational; purpose: number of worker attempts made for this job.';

comment on column public.resource_summary_jobs.payload is
  'notes: operational; purpose: typed resource summary job payload without raw extracted text or generated summary content.';

comment on column public.resource_summary_jobs.locked_at is
  'notes: operational; purpose: worker claim timestamp.';

comment on column public.resource_summary_jobs.locked_by is
  'notes: operational; purpose: worker claim owner identifier.';

comment on column public.resource_summary_jobs.heartbeat_at is
  'notes: operational; purpose: worker heartbeat timestamp.';

comment on column public.resource_summary_jobs.available_at is
  'notes: operational; purpose: earliest timestamp when the job may be claimed.';

comment on column public.resource_summary_jobs.enqueued_at is
  'notes: operational; purpose: timestamp when resource indexing success requested a summary.';

comment on column public.resource_summary_jobs.started_at is
  'notes: operational; purpose: worker execution start timestamp.';

comment on column public.resource_summary_jobs.completed_at is
  'notes: operational; purpose: worker success timestamp.';

comment on column public.resource_summary_jobs.failed_at is
  'notes: operational; purpose: worker failure timestamp.';

comment on column public.resource_summary_jobs.last_error is
  'notes: operational; purpose: sanitized worker error summary.';

comment on column public.resource_summary_jobs.created_at is
  'notes: operational; purpose: job row audit timestamp.';

comment on column public.resource_summary_jobs.updated_at is
  'notes: operational; purpose: job row audit timestamp.';

create index resource_summary_jobs_student_id_idx
  on public.resource_summary_jobs (student_id);

create index resource_summary_jobs_resource_id_idx
  on public.resource_summary_jobs (resource_id);

create index resource_summary_jobs_status_priority_available_at_idx
  on public.resource_summary_jobs (status, priority, available_at);

create index resource_summary_jobs_student_resource_idx
  on public.resource_summary_jobs (student_id, resource_id);

create index resource_summary_jobs_enqueued_at_idx
  on public.resource_summary_jobs (enqueued_at);

alter table public.resource_summary_jobs enable row level security;
alter table public.resource_summary_jobs force row level security;

create policy resource_summary_jobs_select_own
  on public.resource_summary_jobs
  for select
  to authenticated
  using (student_id = auth.uid());
